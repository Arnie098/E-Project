<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Contribution;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function contributions(Request $request): Response
    {
        $mine = $request->user()->contributions()->latest()->get();

        return Inertia::render('user/community-contributions', [
            'contributions' => $mine->map(fn (Contribution $c) => [
                'id' => $c->id,
                'item' => $c->item,
                'description' => $c->description,
                'type' => $c->type,
                'status' => $c->status,
                'submittedAt' => $c->created_at->format('M j, Y'),
            ]),
            'types' => ['Story', 'Audio', 'Image', 'Text'],
            'stats' => [
                'total' => $mine->count(),
                'pending' => $mine->where('status', 'Pending')->count(),
                'approved' => $mine->where('status', 'Approved')->count(),
            ],
        ]);
    }

    public function storeContribution(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:Story,Audio,Image,Text'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        Contribution::create([
            'user_id' => $user->id,
            'contributor_name' => $user->name,
            'item' => $validated['item'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => 'Pending',
        ]);

        ActivityLog::record($user->username ?? $user->name, "Submitted a {$validated['type']} contribution: {$validated['item']}", 'users');

        return back()->with('status', 'Thank you! Your contribution was submitted for review.');
    }

    public function feedback(Request $request): Response
    {
        $mine = $request->user()->feedback()->latest()->get();

        return Inertia::render('user/feedback', [
            'feedback' => $mine->map(fn (Feedback $f) => [
                'id' => $f->id,
                'subject' => $f->subject,
                'body' => $f->body,
                'rating' => $f->rating,
                'status' => $f->status,
                'submittedAt' => $f->created_at->format('M j, Y'),
            ]),
            'stats' => [
                'total' => $mine->count(),
                'averageRating' => $mine->whereNotNull('rating')->avg('rating')
                    ? round($mine->whereNotNull('rating')->avg('rating'), 1)
                    : null,
            ],
        ]);
    }

    public function storeFeedback(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $user = $request->user();

        Feedback::create([
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'rating' => $validated['rating'],
            'status' => 'Open',
        ]);

        ActivityLog::record($user->username ?? $user->name, "Submitted feedback: {$validated['subject']}", 'message-square');

        return back()->with('status', 'Thanks for your feedback!');
    }
}
