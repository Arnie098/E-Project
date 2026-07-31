<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VocabularyWord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Voice / text translation into Bagobo Tagabawa.
 *
 * The mobile app performs speech-to-text on-device (English or Tagalog) and
 * posts the recognized text here. Bagobo Tagabawa is a low-resource language
 * with no off-the-shelf machine translation, so the AI is grounded STRICTLY in
 * the platform's own verified Vocabulary Dictionary and never invents dialect
 * data. Matching dictionary entries are returned together with their stored
 * native-speaker pronunciation audio so the client can play an authentic
 * recording for output pronunciation.
 */
class TranslationController extends Controller
{
    /** Supported source languages. The target is always Bagobo Tagabawa. */
    private const LANGUAGES = [
        'en' => 'English',
        'tl' => 'Tagalog',
    ];

    public function translate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
            'source' => ['required', 'string', 'in:en,tl'],
        ]);

        $text = trim($validated['text']);
        $source = $validated['source'];

        if ($text === '') {
            return response()->json(['message' => 'Nothing to translate.'], 422);
        }

        $dictionary = VocabularyWord::with('pronunciationRecord')->orderBy('word')->get();
        $matches = $this->relevantEntries($dictionary, $text);

        try {
            $translation = $this->translateWithAi($text, $source, $dictionary);
        } catch (\Throwable $e) {
            Log::warning('Translation failed: '.$e->getMessage());

            return response()->json([
                'message' => 'The translation service is temporarily unavailable. Please try again.',
            ], 503);
        }

        return response()->json([
            'source' => $source,
            'sourceLabel' => self::LANGUAGES[$source],
            'target' => 'bagobo',
            'targetLabel' => 'Bagobo Tagabawa',
            'input' => $text,
            'translation' => $translation,
            'matches' => $matches->map(fn (VocabularyWord $w) => [
                'id' => $w->id,
                'word' => $w->word,
                'meaning' => $w->meaning,
                'pronunciation' => $w->pronunciation,
                'audio' => $w->pronunciationRecord?->audio_file,
                'speaker' => $w->pronunciationRecord?->native_speaker,
            ])->values(),
        ]);
    }

    /**
     * Lexically pick dictionary entries whose Bagobo/English forms overlap the
     * input so the client can surface verified words with pronunciation audio.
     */
    private function relevantEntries($dictionary, string $text)
    {
        $tokens = collect(preg_split('/[^\p{L}]+/u', Str::lower($text)))
            ->filter(fn ($t) => Str::length($t) >= 3)
            ->unique();

        if ($tokens->isEmpty()) {
            return $dictionary->take(0);
        }

        return $dictionary->filter(function (VocabularyWord $w) use ($tokens) {
            $haystack = Str::lower(trim(($w->word ?? '').' '.($w->meaning ?? '')));

            return $tokens->contains(fn ($t) => Str::contains($haystack, $t));
        })->take(8)->values();
    }

    private function translateWithAi(string $text, string $source, $dictionary): string
    {
        $config = config('services.ai');
        $sourceLabel = self::LANGUAGES[$source];

        $glossary = $dictionary
            ->filter(fn (VocabularyWord $w) => filled($w->word) && filled($w->meaning))
            ->take(400)
            ->map(fn (VocabularyWord $w) => '- '.$w->word.' = '.$w->meaning
                .($w->pronunciation ? ' ['.$w->pronunciation.']' : ''))
            ->implode("\n");

        $system = "You are the translation engine for MANAYUN BAGOBO, a platform that "
            ."preserves the Bagobo Tagabawa language of the Philippines. Translate the "
            ."user's {$sourceLabel} text into Bagobo Tagabawa.\n\n"
            ."STRICT RULES:\n"
            ."- Bagobo Tagabawa is a low-resource language. Use ONLY the verified "
            ."vocabulary below plus well-established grammar. Do NOT invent or guess words.\n"
            ."- When a needed word is not in the verified vocabulary, keep the original "
            ."{$sourceLabel} word and mark it like \"word (no verified Bagobo term)\".\n"
            ."- Preserve names, numbers, and punctuation.\n"
            ."- Reply with ONLY the Bagobo Tagabawa translation. No explanations, no quotes.\n\n"
            ."VERIFIED VOCABULARY (Bagobo = meaning):\n"
            .($glossary !== '' ? $glossary : '(none available)');

        return $this->callProvider($config, $system, $text);
    }

    private function callProvider($config, string $system, string $userText): string
    {
        $wireApi = $config['wire_api'] ?? 'messages';
        $key = $config['key'] ?? null;
        $baseUrl = rtrim((string) ($config['base_url'] ?? ''), '/');
        $model = $config['model'] ?? '';

        if (! $key || $baseUrl === '' || ! $model) {
            throw new \RuntimeException('AI service is not configured.');
        }

        $authMethod = $config['auth_method'] ?? 'x-api-key';
        $headers = ['Content-Type' => 'application/json'];

        if ($authMethod === 'apikey' || $authMethod === 'bearer') {
            $headers['Authorization'] = 'Bearer '.$key;
            $headers['api-key'] = $key;
        } else {
            $headers['x-api-key'] = $key;
            $headers['anthropic-version'] = '2023-06-01';
        }

        if ($wireApi === 'responses') {
            $payload = [
                'model' => $model,
                'input' => [
                    ['role' => 'system', 'content' => [['type' => 'input_text', 'text' => $system]]],
                    ['role' => 'user', 'content' => [['type' => 'input_text', 'text' => $userText]]],
                ],
            ];

            if (! empty($config['reasoning_effort'])) {
                $payload['reasoning'] = ['effort' => $config['reasoning_effort']];
            }
            if ($config['disable_response_storage'] ?? false) {
                $payload['store'] = false;
            }

            $response = Http::withHeaders($headers)->timeout(60)->post($baseUrl.'/v1/responses', $payload);

            if ($response->failed()) {
                throw new \RuntimeException('AI request failed: '.$response->status());
            }

            return $this->extractResponsesText($response->json());
        }

        // Anthropic-style messages API fallback.
        $payload = [
            'model' => $model,
            'max_tokens' => 1024,
            'system' => $system,
            'messages' => [
                ['role' => 'user', 'content' => $userText],
            ],
        ];

        $response = Http::withHeaders($headers)->timeout(60)->post($baseUrl.'/v1/messages', $payload);

        if ($response->failed()) {
            throw new \RuntimeException('AI request failed: '.$response->status());
        }

        $data = $response->json();

        $text = collect($data['content'] ?? [])
            ->map(fn ($b) => $b['text'] ?? '')
            ->implode("\n");

        return trim($text) ?: 'No translation returned.';
    }

    private function extractResponsesText($data): string
    {
        if (! is_array($data)) {
            return 'No translation returned.';
        }

        if (! empty($data['output_text'])) {
            $ot = $data['output_text'];

            return trim(is_array($ot) ? implode("\n", $ot) : (string) $ot);
        }

        $text = collect($data['output'] ?? [])
            ->flatMap(fn ($item) => $item['content'] ?? [])
            ->map(fn ($c) => $c['text'] ?? ($c['output_text'] ?? ''))
            ->filter()
            ->implode("\n");

        return trim($text) ?: 'No translation returned.';
    }
}
