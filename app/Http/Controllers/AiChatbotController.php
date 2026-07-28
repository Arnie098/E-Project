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
            'configured' => filled(config('services.anthropic.key')),
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

        $key = config('services.anthropic.key');
        if (blank($key)) {
            return response()->json([
                'error' => 'The AI assistant is not configured yet. Add an ANTHROPIC_API_KEY to your .env file to enable it.',
            ], 503);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $key,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(60)->post('https://api.anthropic.com/v1/messages', [
                'model' => config('services.anthropic.model', 'claude-opus-4-8'),
                'max_tokens' => 1500,
                'system' => self::SYSTEM_PROMPT,
                'messages' => $validated['messages'],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Anthropic request failed', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'Could not reach the assistant. Check your connection and try again.'], 502);
        }

        if ($response->failed()) {
            Log::warning('Anthropic API error', ['status' => $response->status(), 'body' => $response->body()]);

            return response()->json(['error' => 'The assistant ran into a problem. Please try again in a moment.'], 502);
        }

        $data = $response->json();

        // Safety classifiers can decline with a 200 + stop_reason "refusal" and empty content.
        if (($data['stop_reason'] ?? null) === 'refusal') {
            return response()->json(['reply' => "I'm sorry, I can't help with that. Try asking me about Bagobo Tagabawa language or culture."]);
        }

        $textBlock = collect($data['content'] ?? [])->firstWhere('type', 'text');
        $reply = $textBlock['text'] ?? null;

        if (blank($reply)) {
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
}
