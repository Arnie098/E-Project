<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatAttachment;
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
        foreach ($conversation->messages()->with('attachments')->get() as $log) {
            /** @var ChatLog $log */
            if ($log->user_message !== null && $log->user_message !== '') {
                $userMessage = ['role' => 'user', 'content' => $log->user_message];

                if ($log->attachments->isNotEmpty()) {
                    $userMessage['attachments'] = $log->attachments
                        ->map(fn (ChatAttachment $a) => $this->attachmentPayload($a))
                        ->all();
                }

                $messages[] = $userMessage;
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

        // Delete child messages first so we never leave orphaned chat_logs
        // (the conversation_id foreign key is nullOnDelete, not cascade).
        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /**
     * Attachment metadata for the mobile client. Unlike the web controller this
     * points at the token-authenticated API route so React Native can fetch the
     * file with the learner's bearer token.
     *
     * @return array<string, mixed>
     */
    private function attachmentPayload(ChatAttachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'name' => $attachment->original_name,
            'kind' => $attachment->kind,
            'mime' => $attachment->mime,
            'size' => (int) $attachment->size,
            'url' => route('api.chatbot.attachment', $attachment->id),
            'readable' => $attachment->kind === 'image' || filled($attachment->extracted_text),
        ];
    }
}
