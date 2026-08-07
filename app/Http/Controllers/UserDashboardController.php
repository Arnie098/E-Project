<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\RepositoryItem;
use App\Models\Story;
use App\Models\VocabularyWord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    public function settings(Request $request): Response
    {
        $user = $request->user();
        $modules = $user->learningModules()->get();

        return Inertia::render('user/settings', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => ucfirst($user->role === 'learner' ? 'Learner' : $user->role),
                'bio' => $user->bio,
                'location' => $user->location,
                'avatar' => $user->avatar_path,
                'memberSince' => $user->created_at->format('M j, Y'),
            ],
            'accountSummary' => [
                'role' => $user->role === 'learner' ? 'Learner' : ucfirst($user->role),
                'memberSince' => $user->created_at->format('M j, Y'),
                'modulesCompleted' => $modules->where('pivot.progress', 100)->count(),
                'certificatesEarned' => 2,
            ],
            'achievements' => $user->achievements()->get()->map(fn ($a) => [
                'name' => $a->name,
                'description' => $a->description,
                'icon' => $a->icon,
                'earnedAt' => $a->pivot->earned_at ? Carbon::parse($a->pivot->earned_at)->format('M j, Y') : null,
            ]),
            'recentActivity' => [
                ['icon' => 'book-open', 'text' => 'Completed "Traditional Beliefs"', 'when' => '2 hours ago'],
                ['icon' => 'eye', 'text' => 'Viewed "Bagobo Weaving Technique"', 'when' => 'Yesterday'],
                ['icon' => 'trophy', 'text' => 'Earned "Active Contributor" badge', 'when' => '2 days ago'],
                ['icon' => 'users', 'text' => 'Submitted a community story', 'when' => '3 days ago'],
                ['icon' => 'book-open', 'text' => 'Completed "Basic Vocabulary"', 'when' => '5 days ago'],
            ],
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path && str_starts_with($user->avatar_path, '/storage/')) {
                Storage::disk('public')->delete(substr($user->avatar_path, strlen('/storage/')));
            }

            $validated['avatar_path'] = '/storage/'.$request->file('avatar')->store('avatars', 'public');
        }

        unset($validated['avatar']);
        $user->update($validated);

        return back()->with('status', 'Profile updated.');
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $modules = $user->learningModules()->orderByPivot('progress', 'desc')->get();
        $completed = $modules->where('pivot.progress', 100)->count();

        return Inertia::render('user/dashboard', [
            'firstName' => explode(' ', $user->name)[0],
            'continueLearning' => $modules->where('pivot.progress', '<', 100)->take(3)->values()
                ->map(fn ($m) => ['title' => $m->title, 'progress' => $m->pivot->progress]),
            'stats' => [
                'modulesCompleted' => $completed,
                'modulesTotal' => $modules->count(),
            ],
            'events' => Event::where('starts_at', '>=', now())->orderBy('starts_at')->take(2)->get()
                ->map(fn ($e) => ['title' => $e->title, 'when' => $e->starts_at->format('M j, Y · g:i A')]),
            'announcement' => Announcement::orderByDesc('published_at')->first(),
        ]);
    }

    public function multimediaGallery(): Response
    {
        return Inertia::render('user/multimedia-gallery', [
            'media' => MediaItem::orderByDesc('published_at')->get()->map(fn ($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'category' => $m->category,
                'type' => $m->media_type,
                'date' => $m->published_at?->format('M j, Y'),
                'views' => $m->views,
                'duration' => $m->duration,
                'thumbnail' => $m->thumbnail,
            ]),
        ]);
    }

    public function storytellingArchive(): Response
    {
        $stories = Story::orderByDesc('published_at')->get();

        $map = fn ($s) => [
            'id' => $s->id,
            'title' => $s->title,
            'type' => $s->story_type,
            'author' => $s->author,
            'date' => $s->published_at?->format('M j, Y'),
            'views' => $s->views,
            'readTime' => $s->read_time,
            'summary' => $s->summary,
            'categories' => $s->categories ?? [],
            'image' => $s->image,
        ];

        return Inertia::render('user/storytelling-archive', [
            'stories' => $stories->map($map)->values(),
            'featured' => $map($stories->first()),
        ]);
    }

    public function vocabularyDictionary(): Response
    {
        $words = VocabularyWord::with('pronunciationRecord.verifier')->orderBy('word')->get();

        return Inertia::render('user/vocabulary-dictionary', [
            'words' => $words->map(fn (VocabularyWord $w) => [
                'id' => $w->id,
                'word' => $w->word,
                'meaning' => $w->meaning,
                'pronunciation' => $w->pronunciation,
                'category' => $w->category,
                'example' => $w->example,
                'initial' => mb_strtoupper(mb_substr($w->word, 0, 1)),
                'audio' => $w->pronunciationRecord?->audio_file,
                'speaker' => $w->pronunciationRecord?->native_speaker,
                'verifiedBy' => $w->pronunciationRecord?->verifier?->name,
            ])->values(),
            'categories' => $words->pluck('category')->filter()->unique()->sort()->values(),
            'stats' => [
                'total' => $words->count(),
                'categories' => $words->pluck('category')->filter()->unique()->count(),
                'verified' => $words->filter(fn ($w) => $w->pronunciationRecord !== null)->count(),
            ],
        ]);
    }

    public function culturalRepository(): Response
    {
        $items = RepositoryItem::latest()->get();

        return Inertia::render('user/cultural-repository', [
            'items' => $items->map(fn (RepositoryItem $i) => [
                'id' => $i->id,
                'title' => $i->title,
                'category' => $i->category,
                'type' => $i->type,
                'description' => $i->description,
                'media' => $i->media,
                'date' => $i->created_at->format('M j, Y'),
            ])->values(),
            'categories' => $items->pluck('category')->filter()->unique()->sort()->values(),
            'types' => $items->pluck('type')->filter()->unique()->sort()->values(),
        ]);
    }

    public function events(): Response
    {
        $events = Event::orderBy('starts_at')->get();
        $now = now();

        $map = fn (Event $e) => [
            'id' => $e->id,
            'title' => $e->title,
            'weekday' => $e->starts_at->format('l'),
            'date' => $e->starts_at->format('M j, Y'),
            'time' => $e->starts_at->format('g:i A'),
            'month' => $e->starts_at->format('M'),
            'day' => $e->starts_at->format('j'),
            'location' => $e->location,
        ];

        return Inertia::render('user/events', [
            'upcoming' => $events->filter(fn (Event $e) => $e->starts_at->gte($now))->map($map)->values(),
            'past' => $events->filter(fn (Event $e) => $e->starts_at->lt($now))
                ->sortByDesc('starts_at')->map($map)->values(),
        ]);
    }
}
