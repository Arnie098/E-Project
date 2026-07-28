<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Contribution;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\QuizResult;
use App\Models\RepositoryItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'activeLearners' => User::where('role', 'learner')->count(),
                'learningMaterials' => LearningModule::count(),
                'repositoryItems' => RepositoryItem::count(),
                'pendingReviews' => Contribution::where('status', 'Pending')->count(),
                'feedback' => Feedback::count(),
            ],
            'contributions' => Contribution::latest()->take(6)->get()->map(fn ($c) => [
                'id' => $c->id,
                'user' => $c->contributor_name ?? optional($c->user)->name ?? 'Unknown',
                'item' => $c->item,
                'type' => $c->type,
                'status' => $c->status,
            ]),
            'events' => Event::where('starts_at', '>=', now())->orderBy('starts_at')->take(2)->get()
                ->map(fn ($e) => ['title' => $e->title, 'when' => $e->starts_at->format('M j, Y')]),
            'activity' => ActivityLog::query()
                ->latest('occurred_at')
                ->take(4)
                ->get()
                ->map(fn ($log) => [
                    'text' => $log->action,
                    'actor' => $log->actor ?? 'System',
                    'when' => $log->occurred_at?->format('M j, Y g:i A') ?? $log->updated_at->format('M j, Y g:i A'),
                ]),
        ]);
    }

    public function users(): Response
    {
        return Inertia::render('admin/users', [
            'users' => User::orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'role' => $u->role,
                'status' => $u->status,
                'joined' => $u->created_at->format('M j, Y'),
            ]),
            'stats' => [
                'total' => User::count(),
                'staff' => User::whereIn('role', ['admin', 'super'])->count(),
                'learners' => User::where('role', 'learner')->count(),
            ],
        ]);
    }

    public function toggleUserStatus(Request $request, User $user): RedirectResponse
    {
        // Admins may only moderate learner accounts; roles and staff accounts are Super-only.
        if ($user->role !== 'learner') {
            return back()->with('status', 'Only learner accounts can be managed here.');
        }

        $user->update(['status' => $user->status === 'Active' ? 'Inactive' : 'Active']);

        ActivityLog::record(
            $request->user()->username ?? $request->user()->name,
            ($user->status === 'Active' ? 'Activated' : 'Deactivated')." learner {$user->name}",
            'user-cog',
        );

        return back()->with('status', "{$user->name} is now {$user->status}.");
    }

    public function reports(): Response
    {
        $quizTotal = QuizResult::count();
        $quizPassed = QuizResult::where('remarks', 'Passed')->count();
        $rated = Feedback::whereNotNull('rating');
        $learners = max(User::where('role', 'learner')->count(), 1);

        return Inertia::render('admin/reports', [
            'summary' => [
                ['label' => 'Learners', 'value' => User::where('role', 'learner')->count(), 'icon' => 'users'],
                ['label' => 'Learning Modules', 'value' => LearningModule::count(), 'icon' => 'book-open'],
                ['label' => 'Repository Items', 'value' => RepositoryItem::count(), 'icon' => 'landmark'],
                ['label' => 'Multimedia', 'value' => MediaItem::count(), 'icon' => 'image'],
            ],
            'contributions' => [
                'pending' => Contribution::where('status', 'Pending')->count(),
                'approved' => Contribution::where('status', 'Approved')->count(),
                'rejected' => Contribution::where('status', 'Rejected')->count(),
                'total' => Contribution::count(),
            ],
            'quiz' => [
                'taken' => $quizTotal,
                'passRate' => $quizTotal ? (int) round($quizPassed / $quizTotal * 100) : 0,
            ],
            'feedback' => [
                'count' => Feedback::count(),
                'average' => (clone $rated)->count() ? round((clone $rated)->avg('rating'), 1) : null,
            ],
            'moduleCompletion' => LearningModule::withCount([
                'users as completed' => fn ($q) => $q->whereNotNull('learning_module_user.completed_at'),
            ])->orderByDesc('completed')->take(6)->get()->map(fn (LearningModule $m) => [
                'title' => $m->title,
                'completed' => $m->completed,
                'pct' => (int) round($m->completed / $learners * 100),
            ]),
        ]);
    }
}
