<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Contribution;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function contributions(Request $request): JsonResponse
    {
        $mine = $request->user()->contributions()->latest()->get();

        return response()->json([
            'contributions' => $mine->map(fn (Contribution $c) => [
                'id' => $c->id,
                'item' => $c->item,
                'description' => $c->description,
                'type' => $c->type,
                'status' => $c->status,
                'submittedAt' => $c->created_at->format('M j, Y'),
            ])->values(),
            'types' => ['Story', 'Audio', 'Image', 'Text'],
            'stats' => [
                'total' => $mine->count(),
                'pending' => $mine->where('status', 'Pending')->count(),
                'approved' => $mine->where('status', 'Approved')->count(),
            ],
        ]);
    }

    public function storeContribution(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:Story,Audio,Image,Text'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        $c = Contribution::create([
            'user_id' => $user->id,
            'contributor_name' => $user->name,
            'item' => $validated['item'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => 'Pending',
        ]);

        ActivityLog::record($user->username ?? $user->name, "Submitted a {$validated['type']} contribution: {$validated['item']}", 'users');

        return response()->json([
            'contribution' => [
                'id' => $c->id,
                'item' => $c->item,
                'description' => $c->description,
                'type' => $c->type,
                'status' => $c->status,
                'submittedAt' => $c->created_at->format('M j, Y'),
            ],
        ], 201);
    }

    public function feedback(Request $request): JsonResponse
    {
        $mine = $request->user()->feedback()->latest()->get();

        return response()->json([
            'feedback' => $mine->map(fn (Feedback $f) => [
                'id' => $f->id,
                'subject' => $f->subject,
                'body' => $f->body,
                'rating' => $f->rating,
                'status' => $f->status,
                'submittedAt' => $f->created_at->format('M j, Y'),
            ])->values(),
            'stats' => [
                'total' => $mine->count(),
                'averageRating' => $mine->whereNotNull('rating')->avg('rating')
                    ? round($mine->whereNotNull('rating')->avg('rating'), 1)
                    : null,
            ],
        ]);
    }

    public function storeFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $user = $request->user();

        $f = Feedback::create([
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'rating' => $validated['rating'],
            'status' => 'Open',
        ]);

        ActivityLog::record($user->username ?? $user->name, "Submitted feedback: {$validated['subject']}", 'message-square');

        return response()->json([
            'feedback' => [
                'id' => $f->id,
                'subject' => $f->subject,
                'body' => $f->body,
                'rating' => $f->rating,
                'status' => $f->status,
                'submittedAt' => $f->created_at->format('M j, Y'),
            ],
        ], 201);
    }
}
