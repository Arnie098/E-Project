<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/*
 | Chat history endpoints for the mobile app. Sending a message is handled by
 | the web AiChatbotController@chat (reused via routes/api.php) so the mobile
 | app benefits from the exact same scope-gating and AI request logic.
 */
class ChatbotController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $conversations = $request->user()->chatConversations()
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (ChatConversation $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'updated_at' => $c->updated_at?->toIso8601String(),
            ])->values();

        return response()->json(['conversations' => $conversations]);
    }

    public function conversation(Request $request, ChatConversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $messages = [];
        foreach ($conversation->messages()->get() as $log) {
            /** @var ChatLog $log */
            if ($log->user_message !== null && $log->user_message !== '') {
                $messages[] = ['role' => 'user', 'content' => $log->user_message];
            }
            if ($log->bot_response !== null) {
                $messages[] = ['role' => 'assistant', 'content' => $log->bot_response];
            }
        }

        return response()->json([
            'id' => $conversation->id,
            'title' => $conversation->title,
            'messages' => $messages,
        ]);
    }

    public function destroyConversation(Request $request, ChatConversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
