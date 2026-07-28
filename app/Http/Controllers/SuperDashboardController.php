<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\ChatLog;
use App\Models\Contribution;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\QuizResult;
use App\Models\RepositoryItem;
use App\Models\ResourceVerification;
use App\Models\Setting;
use App\Models\Story;
use App\Models\User;
use App\Models\VocabularyWord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperDashboardController extends Controller
{
    // Map domain icons onto the keys the dashboard widget already knows.
    private const DASHBOARD_ICON = [
        'users' => 'user-plus',
        'book-open' => 'file-pen',
        'message-square' => 'file-pen',
        'shield-check' => 'shield-check',
        'database' => 'database',
    ];

    private const ICON_TONE = [
        'shield-check' => 'blue',
        'database' => 'purple',
        'user-plus' => 'green',
        'file-pen' => 'amber',
        'user-cog' => 'amber',
    ];

    public function index(): Response
    {
        $announcement = Announcement::latest('published_at')->first();

        return Inertia::render('super/dashboard', [
            'stats' => [
                'totalUsers' => User::count(),
                'learningMaterials' => LearningModule::count(),
                'repositoryItems' => RepositoryItem::count(),
                'contributions' => Contribution::count(),
            ],
            'roleDistribution' => $this->roleDistribution(),
            'totalUsers' => User::count(),
            'logs' => ActivityLog::latest('occurred_at')->take(5)->get()->map(function (ActivityLog $l) {
                $icon = self::DASHBOARD_ICON[$l->icon] ?? 'user-cog';

                return [
                    'text' => $l->action,
                    'icon' => $icon,
                    'tone' => self::ICON_TONE[$icon] ?? 'blue',
                    'when' => optional($l->occurred_at)->format('M j, Y · g:i A'),
                ];
            }),
            'announcement' => $announcement ? [
                'title' => $announcement->title,
                'body' => $announcement->body,
                'when' => optional($announcement->published_at)->format('M j, Y'),
                'author' => $announcement->author ?? 'System',
            ] : ['title' => 'No announcements', 'body' => 'Nothing to report.', 'when' => '', 'author' => 'System'],
        ]);
    }

    public function overview(): Response
    {
        return Inertia::render('super/overview', [
            'users' => [
                'total' => User::count(),
                'super' => User::where('role', 'super')->count(),
                'admin' => User::where('role', 'admin')->count(),
                'learner' => User::where('role', 'learner')->count(),
                'inactive' => User::where('status', 'Inactive')->count(),
            ],
            'content' => [
                ['label' => 'Learning Modules', 'value' => LearningModule::count(), 'icon' => 'book-open'],
                ['label' => 'Repository Items', 'value' => RepositoryItem::count(), 'icon' => 'landmark'],
                ['label' => 'Multimedia', 'value' => MediaItem::count(), 'icon' => 'image'],
                ['label' => 'Stories', 'value' => Story::count(), 'icon' => 'scroll-text'],
                ['label' => 'Vocabulary', 'value' => VocabularyWord::count(), 'icon' => 'book'],
                ['label' => 'Events', 'value' => Event::count(), 'icon' => 'calendar'],
            ],
            'engagement' => [
                ['label' => 'Quizzes Taken', 'value' => QuizResult::count(), 'icon' => 'list-checks'],
                ['label' => 'Chatbot Messages', 'value' => ChatLog::count(), 'icon' => 'message-square'],
                ['label' => 'Pending Contributions', 'value' => Contribution::where('status', 'Pending')->count(), 'icon' => 'users'],
                ['label' => 'Feedback Entries', 'value' => Feedback::count(), 'icon' => 'message-circle'],
                ['label' => 'Verifications', 'value' => ResourceVerification::count(), 'icon' => 'shield-check'],
            ],
            'recentActivity' => $this->recentActivity(8),
        ]);
    }

    public function users(): Response
    {
        return Inertia::render('super/users', [
            'users' => User::orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'role' => $u->role,
                'status' => $u->status,
                'joined' => $u->created_at->format('M j, Y'),
            ]),
            'roleCounts' => [
                'super' => User::where('role', 'super')->count(),
                'admin' => User::where('role', 'admin')->count(),
                'learner' => User::where('role', 'learner')->count(),
            ],
        ]);
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'in:learner,admin,super'],
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        // Guard against locking yourself out of the super role.
        if ($request->user()->id === $user->id && $validated['role'] !== 'super') {
            return back()->with('status', 'You cannot change your own Super Admin role.');
        }

        $user->update($validated);

        ActivityLog::record(
            $request->user()->username ?? $request->user()->name,
            "Updated account {$user->username}: {$validated['role']} / {$validated['status']}",
            'user-cog',
        );

        return back()->with('status', "Updated {$user->name}'s account.");
    }

    public function destroyUser(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->id === $user->id) {
            return back()->with('status', 'You cannot delete your own account.');
        }

        if ($user->role === 'super' && User::where('role', 'super')->count() <= 1) {
            return back()->with('status', 'Cannot delete the last Super Admin.');
        }

        $name = $user->name;
        $user->delete();

        ActivityLog::record($request->user()->username ?? $request->user()->name, "Deleted account: {$name}", 'user-cog');

        return back()->with('status', "Deleted {$name}'s account.");
    }

    public function logs(): Response
    {
        return Inertia::render('super/logs', [
            'logs' => $this->recentActivity(100),
        ]);
    }

    public function roles(): Response
    {
        return Inertia::render('super/roles', [
            'roles' => [
                [
                    'key' => 'super', 'label' => 'Super Admin', 'count' => User::where('role', 'super')->count(),
                    'summary' => 'Full control over the entire system.',
                    'permissions' => ['Manage all accounts and roles', 'Access every admin and learner area', 'View activity logs and system reports', 'Configure system-wide settings'],
                ],
                [
                    'key' => 'admin', 'label' => 'Admin', 'count' => User::where('role', 'admin')->count(),
                    'summary' => 'Manages educational and cultural content.',
                    'permissions' => ['Create and manage learning materials', 'Manage the cultural repository and media', 'Review and verify community contributions', 'Manage cultural events and feedback'],
                ],
                [
                    'key' => 'learner', 'label' => 'Learner', 'count' => User::where('role', 'learner')->count(),
                    'summary' => 'Accesses learning and cultural resources.',
                    'permissions' => ['Take lessons and quizzes, track progress', 'Browse repository, gallery, and stories', 'Use the AI chatbot and vocabulary dictionary', 'Submit contributions and feedback'],
                ],
            ],
            // Reflects the actual route middleware (role:admin,super / role:super / auth).
            'matrix' => [
                ['area' => 'View learning content', 'super' => true, 'admin' => true, 'learner' => true],
                ['area' => 'Take quizzes & track progress', 'super' => true, 'admin' => true, 'learner' => true],
                ['area' => 'Manage learning materials', 'super' => true, 'admin' => true, 'learner' => false],
                ['area' => 'Manage cultural repository', 'super' => true, 'admin' => true, 'learner' => false],
                ['area' => 'Verify community contributions', 'super' => true, 'admin' => true, 'learner' => false],
                ['area' => 'Manage events & feedback', 'super' => true, 'admin' => true, 'learner' => false],
                ['area' => 'Manage accounts & roles', 'super' => true, 'admin' => false, 'learner' => false],
                ['area' => 'View activity logs & reports', 'super' => true, 'admin' => false, 'learner' => false],
                ['area' => 'Configure system settings', 'super' => true, 'admin' => false, 'learner' => false],
            ],
        ]);
    }

    public function content(): Response
    {
        return Inertia::render('super/content', [
            'inventory' => [
                ['label' => 'Learning Modules', 'value' => LearningModule::count(), 'icon' => 'book-open', 'href' => '/admin/learning-materials'],
                ['label' => 'Repository Items', 'value' => RepositoryItem::count(), 'icon' => 'landmark', 'href' => '/admin/cultural-repository'],
                ['label' => 'Multimedia', 'value' => MediaItem::count(), 'icon' => 'image', 'href' => '/admin/multimedia'],
                ['label' => 'Stories', 'value' => Story::count(), 'icon' => 'scroll-text', 'href' => '/user/storytelling-archive'],
                ['label' => 'Vocabulary', 'value' => VocabularyWord::count(), 'icon' => 'book', 'href' => '/user/vocabulary-dictionary'],
                ['label' => 'Events', 'value' => Event::count(), 'icon' => 'calendar', 'href' => '/admin/events'],
                ['label' => 'Contributions', 'value' => Contribution::count(), 'icon' => 'users', 'href' => '/admin/contributions'],
            ],
            'contributionStatus' => [
                'pending' => Contribution::where('status', 'Pending')->count(),
                'approved' => Contribution::where('status', 'Approved')->count(),
                'rejected' => Contribution::where('status', 'Rejected')->count(),
            ],
            'recent' => RepositoryItem::latest()->take(6)->get()->map(fn (RepositoryItem $r) => [
                'id' => $r->id,
                'title' => $r->title,
                'type' => $r->type,
                'category' => $r->category,
                'date' => $r->created_at->format('M j, Y'),
            ]),
        ]);
    }

    public function reports(): Response
    {
        $quizTotal = QuizResult::count();
        $quizPassed = QuizResult::where('remarks', 'Passed')->count();
        $rated = Feedback::whereNotNull('rating');
        $learners = max(User::where('role', 'learner')->count(), 1);

        return Inertia::render('super/reports', [
            'users' => [
                'total' => User::count(),
                'super' => User::where('role', 'super')->count(),
                'admin' => User::where('role', 'admin')->count(),
                'learner' => User::where('role', 'learner')->count(),
            ],
            'content' => [
                ['label' => 'Learning Modules', 'value' => LearningModule::count()],
                ['label' => 'Repository Items', 'value' => RepositoryItem::count()],
                ['label' => 'Multimedia', 'value' => MediaItem::count()],
                ['label' => 'Stories', 'value' => Story::count()],
                ['label' => 'Vocabulary', 'value' => VocabularyWord::count()],
                ['label' => 'Events', 'value' => Event::count()],
            ],
            'engagement' => [
                'quizzesTaken' => $quizTotal,
                'passRate' => $quizTotal ? (int) round($quizPassed / $quizTotal * 100) : 0,
                'chatMessages' => ChatLog::count(),
                'contributions' => Contribution::count(),
                'pendingContributions' => Contribution::where('status', 'Pending')->count(),
                'feedbackCount' => Feedback::count(),
                'averageRating' => (clone $rated)->count() ? round((clone $rated)->avg('rating'), 1) : null,
                'verifications' => ResourceVerification::count(),
            ],
            'topModules' => LearningModule::withCount([
                'users as completed' => fn ($q) => $q->whereNotNull('learning_module_user.completed_at'),
            ])->orderByDesc('completed')->take(6)->get()->map(fn (LearningModule $m) => [
                'title' => $m->title,
                'completed' => $m->completed,
                'pct' => (int) round($m->completed / $learners * 100),
            ]),
        ]);
    }

    public function settings(): Response
    {
        return Inertia::render('super/settings', [
            'settings' => [
                'siteName' => Setting::get('site_name', config('app.name')),
                'tagline' => Setting::get('tagline', ''),
                'maintenance' => Setting::get('maintenance_mode', '0') === '1',
            ],
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'siteName' => 'required|string|max:100',
            'tagline' => 'nullable|string|max:200',
            'maintenance' => 'boolean',
        ]);

        Setting::set('site_name', $validated['siteName']);
        Setting::set('tagline', $validated['tagline'] ?? '');
        Setting::set('maintenance_mode', $request->boolean('maintenance') ? '1' : '0');

        ActivityLog::record($request->user()->username ?? $request->user()->name, 'Updated system settings', 'settings');

        return back()->with('status', 'Settings saved.');
    }

    private function roleDistribution(): array
    {
        $total = max(User::count(), 1);
        $pct = fn (int $v) => round($v / $total * 100, 1).'%';

        return [
            ['label' => 'Super Admins', 'value' => User::where('role', 'super')->count(), 'percent' => $pct(User::where('role', 'super')->count()), 'tone' => 'purple'],
            ['label' => 'Admins', 'value' => User::where('role', 'admin')->count(), 'percent' => $pct(User::where('role', 'admin')->count()), 'tone' => 'blue'],
            ['label' => 'Learners', 'value' => User::where('role', 'learner')->count(), 'percent' => $pct(User::where('role', 'learner')->count()), 'tone' => 'green'],
        ];
    }

    private function recentActivity(int $take): \Illuminate\Support\Collection
    {
        return ActivityLog::latest('occurred_at')->take($take)->get()->map(fn (ActivityLog $l) => [
            'id' => $l->id,
            'actor' => $l->actor,
            'action' => $l->action,
            'icon' => $l->icon,
            'when' => optional($l->occurred_at)->format('M j, Y · g:i A'),
        ]);
    }
}
