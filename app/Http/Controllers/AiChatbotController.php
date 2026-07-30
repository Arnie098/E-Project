<?php

namespace App\Http\Controllers;

use App\Models\ChatLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AiChatbotController extends Controller
{
    /**
     * The assistant's persona. Kept deliberately careful about the dialect:
     * this is an endangered-language project, so the model is told not to
     * fabricate Bagobo Tagabawa words it isn't confident about.
     */
    private const SYSTEM_PROMPT = <<<'PROMPT'
        You are "Epanaw", the friendly AI guide inside EPANAW BAGOBO — a platform for
        preserving and revitalizing the Bagobo Tagabawa dialect and cultural heritage of
        Mindanao, Philippines. You help learners explore the language, traditions, stories,
        crafts, music, and history of the Bagobo Tagabawa people.

        Voice: warm, encouraging, and concise. Prefer short paragraphs. Invite the learner
        to keep exploring the platform's modules, gallery, and storytelling archive.

        Cultural integrity is critical. The Bagobo Tagabawa language is endangered and
        under-documented. Do NOT invent translations, spellings, or "facts" about the
        dialect that you are not confident are accurate — inventing wrong heritage data is
        worse than admitting uncertainty. When you are unsure of a specific word or custom,
        say so plainly and suggest the learner confirm with a community elder, a verified
        entry in the Vocabulary Dictionary, or the Cultural Repository. You may still speak
        generally and accurately about Philippine indigenous ("Lumad") culture and about
        language learning.

        Never claim to perform actions on the platform (saving, enrolling, uploading) — you
        only converse and guide. Keep responses focused on this project's mission.
        PROMPT;

    private const MAX_HISTORY = 20;

    public function index(Request $request): Response
    {
        // Rehydrate the conversation from the user's stored chat logs so it
        // persists across page loads (AI Chatbot Logs, Table 33). Take the most
        // recent 50 exchanges, then restore chronological order.
        $history = $request->user()->chatLogs()->latest()->take(50)->get()
            ->reverse()
            ->flatMap(fn (ChatLog $log) => [
                ['role' => 'user', 'content' => $log->user_message],
                ['role' => 'assistant', 'content' => $log->bot_response],
            ]);

        return Inertia::render('user/ai-chatbot', [
            'configured' => filled(config('services.ai.key')),
            'history' => $history->values(),
            'suggestions' => [
                'What is the Bagobo Tagabawa culture known for?',
                'How can I start learning the dialect?',
                'Tell me about traditional Bagobo weaving.',
                'What stories are in the storytelling archive?',
            ],
        ]);
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:'.self::MAX_HISTORY],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:4000'],
        ]);

        $key = config('services.ai.key');
        if (blank($key)) {
            return response()->json([
                'error' => 'The AI assistant is not configured yet. Add an AI_API_KEY to your .env file to enable it.',
            ], 503);
        }

        try {
            $data = $this->sendAiRequest($validated['messages'], $key);
        } catch (\Throwable $e) {
            Log::warning('AI request failed', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'Could not reach the assistant. Check your connection and try again.'], 502);
        }

        $reply = $this->extractReply($data);

        if (($data['stop_reason'] ?? null) === 'refusal') {
            return response()->json(['reply' => "I'm sorry, I can't help with that. Try asking me about Bagobo Tagabawa language or culture."]);
        }

        if (blank($reply)) {
            Log::warning('AI provider returned an empty response', ['provider' => config('services.ai.provider'), 'body' => $data]);

            return response()->json(['error' => 'The assistant returned an empty response. Please try again.'], 502);
        }

        // Log the exchange. The newest user turn is the last message in the payload.
        $lastUserTurn = collect($validated['messages'])->last(fn ($m) => $m['role'] === 'user');
        $lastUserMessage = $lastUserTurn['content'] ?? '';

        ChatLog::create([
            'user_id' => $request->user()->id,
            'user_message' => $lastUserMessage,
            'bot_response' => $reply,
        ]);

        return response()->json(['reply' => $reply]);
    }

    /**
     * Send the chat request to the configured AI provider.
     */
    private function sendAiRequest(array $messages, string $key): array
    {
        $wireApi = config('services.ai.wire_api', 'messages');
        $baseUrl = rtrim((string) config('services.ai.base_url', 'https://api.anthropic.com'), '/');
        $endpoint = $wireApi === 'responses' ? '/v1/responses' : '/v1/messages';

        $request = Http::withHeaders($this->aiHeaders($key))->timeout(60);
        $payload = $wireApi === 'responses'
            ? $this->responsesPayload($messages)
            : $this->messagesPayload($messages);

        $response = $request->post($baseUrl.$endpoint, $payload);

        if ($response->failed()) {
            Log::warning('AI provider error', [
                'provider' => config('services.ai.provider'),
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \RuntimeException('AI provider returned HTTP '.$response->status());
        }

        return $response->json() ?? [];
    }

    /**
     * Headers support both Anthropic-style x-api-key and OpenAI-compatible Bearer/API key providers.
     */
    private function aiHeaders(string $key): array
    {
        $authMethod = strtolower((string) config('services.ai.auth_method', 'x-api-key'));

        $headers = [
            'content-type' => 'application/json',
        ];

        if ($authMethod === 'apikey' || $authMethod === 'api-key') {
            $headers['Authorization'] = 'Bearer '.$key;
            $headers['api-key'] = $key;
        } elseif ($authMethod === 'bearer') {
            $headers['Authorization'] = 'Bearer '.$key;
        } else {
            $headers['x-api-key'] = $key;
            $headers['anthropic-version'] = '2023-06-01';
        }

        return $headers;
    }

    /**
     * Anthropic Messages API payload.
     */
    private function messagesPayload(array $messages): array
    {
        return [
            'model' => config('services.ai.model'),
            'max_tokens' => 1500,
            'system' => self::SYSTEM_PROMPT,
            'messages' => $messages,
        ];
    }

    /**
     * OpenAI-style Responses API payload used by configurable providers like Aerolink.
     */
    private function responsesPayload(array $messages): array
    {
        $input = collect($messages)->map(fn ($message) => [
            'role' => $message['role'],
            'content' => $message['content'],
        ])->values()->all();

        array_unshift($input, [
            'role' => 'system',
            'content' => self::SYSTEM_PROMPT,
        ]);

        return array_filter([
            'model' => config('services.ai.model'),
            'input' => $input,
            'reasoning' => filled(config('services.ai.reasoning_effort'))
                ? ['effort' => config('services.ai.reasoning_effort')]
                : null,
            'store' => ! filter_var(config('services.ai.disable_response_storage'), FILTER_VALIDATE_BOOLEAN),
        ], fn ($value) => $value !== null);
    }

    /**
     * Extract text from Anthropic Messages or OpenAI-style Responses payloads.
     */
    private function extractReply(array $data): ?string
    {
        $textBlock = collect($data['content'] ?? [])->firstWhere('type', 'text');
        if (filled($textBlock['text'] ?? null)) {
            return $textBlock['text'];
        }

        if (filled($data['output_text'] ?? null)) {
            return $data['output_text'];
        }

        $output = collect($data['output'] ?? []);
        $message = $output->firstWhere('type', 'message');
        $content = collect($message['content'] ?? []);
        $responseText = $content->firstWhere('type', 'output_text');

        return $responseText['text'] ?? null;
    }
}
