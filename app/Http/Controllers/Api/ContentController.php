<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\QuizResult;
use App\Models\RepositoryItem;
use App\Models\Story;
use App\Models\VocabularyWord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ContentController extends Controller
{
    private const PASS_MARK = 60;

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $modules = $user->learningModules()->orderByPivot('progress', 'desc')->get();
        $completed = $modules->where('pivot.progress', 100)->count();
        $announcement = Announcement::orderByDesc('published_at')->first();

        return response()->json([
            'firstName' => explode(' ', $user->name)[0],
            'continueLearning' => $modules->where('pivot.progress', '<', 100)->take(3)->values()
                ->map(fn ($m) => ['id' => $m->id, 'title' => $m->title, 'progress' => (int) $m->pivot->progress]),
            'stats' => [
                'modulesCompleted' => $completed,
                'modulesTotal' => $modules->count(),
            ],
            'events' => Event::where('starts_at', '>=', now())->orderBy('starts_at')->take(3)->get()
                ->map(fn ($e) => ['id' => $e->id, 'title' => $e->title, 'when' => $e->starts_at->format('M j, Y g:i A')]),
            'announcement' => $announcement ? [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'author' => $announcement->author,
                'date' => $announcement->published_at?->format('M j, Y'),
            ] : null,
        ]);
    }

    public function vocabulary(): JsonResponse
    {
        $words = VocabularyWord::with('pronunciationRecord')->orderBy('word')->get();

        return response()->json([
            'words' => $words->map(fn (VocabularyWord $w) => [
                'id' => $w->id,
                'word' => $w->word,
                'meaning' => $w->meaning,
                'pronunciation' => $w->pronunciation,
                'category' => $w->category,
                'example' => $w->example,
                'audio' => $w->pronunciationRecord?->audio_file,
                'speaker' => $w->pronunciationRecord?->native_speaker,
            ])->values(),
            'categories' => $words->pluck('category')->filter()->unique()->sort()->values(),
        ]);
    }

    public function stories(): JsonResponse
    {
        $stories = Story::orderByDesc('published_at')->get();

        return response()->json([
            'stories' => $stories->map(fn (Story $s) => [
                'id' => $s->id,
                'title' => $s->title,
                'type' => $s->story_type,
                'author' => $s->author,
                'date' => $s->published_at?->format('M j, Y'),
                'views' => $s->views,
                'readTime' => $s->read_time,
                'summary' => $s->summary,
                'body' => $s->body,
                'categories' => $s->categories ?? [],
                'image' => $s->image,
            ])->values(),
        ]);
    }

    public function media(): JsonResponse
    {
        return response()->json([
            'media' => MediaItem::orderByDesc('published_at')->get()->map(fn (MediaItem $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'category' => $m->category,
                'type' => $m->media_type,
                'date' => $m->published_at?->format('M j, Y'),
                'views' => $m->views,
                'duration' => $m->duration,
                'thumbnail' => $m->thumbnail,
                'file' => $m->source_file,
            ])->values(),
        ]);
    }

    public function events(): JsonResponse
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

        return response()->json([
            'upcoming' => $events->filter(fn (Event $e) => $e->starts_at->gte($now))->map($map)->values(),
            'past' => $events->filter(fn (Event $e) => $e->starts_at->lt($now))->sortByDesc('starts_at')->map($map)->values(),
        ]);
    }

    public function repository(): JsonResponse
    {
        $items = RepositoryItem::latest()->get();

        return response()->json([
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

    public function modules(Request $request): JsonResponse
    {
        $user = $request->user();
        $mine = $user->learningModules()->get()->keyBy('id');

        $modules = LearningModule::withCount('questions')->orderBy('id')->get()->map(function (LearningModule $m) use ($mine) {
            $pivot = optional($mine->get($m->id))->pivot;
            $progress = (int) ($pivot->progress ?? 0);

            return [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'module' => $m->module ?? 'Language',
                'difficulty' => $m->difficulty ?? 'Beginner',
                'image' => $m->image,
                'questions' => $m->questions_count,
                'progress' => $progress,
                'status' => $this->moduleStatus($progress, $pivot->completed_at ?? null),
            ];
        });

        return response()->json([
            'modules' => $modules->values(),
            'stats' => [
                'total' => $modules->count(),
                'completed' => $modules->where('status', 'Completed')->count(),
                'inProgress' => $modules->where('status', 'In Progress')->count(),
            ],
        ]);
    }

    public function module(Request $request, LearningModule $learningModule): JsonResponse
    {
        $user = $request->user();
        $pivot = optional($user->learningModules()->find($learningModule->id))->pivot;
        $result = $user->quizResults()->where('learning_module_id', $learningModule->id)->latest()->first();
        $progress = (int) ($pivot->progress ?? 0);

        return response()->json([
            'module' => [
                'id' => $learningModule->id,
                'title' => $learningModule->title,
                'description' => $learningModule->description,
                'module' => $learningModule->module ?? 'Language',
                'difficulty' => $learningModule->difficulty ?? 'Beginner',
                'content' => $learningModule->content,
                'progress' => $progress,
                'status' => $this->moduleStatus($progress, $pivot->completed_at ?? null),
            ],
            'questions' => $learningModule->questions()->get()->map(fn ($q) => [
                'id' => $q->id,
                'question' => $q->question,
                'options' => $q->options,
            ])->values(),
            'result' => $result ? [
                'score' => $result->score,
                'total' => $result->total,
                'remarks' => $result->remarks,
                'takenAt' => $result->created_at->format('M j, Y'),
            ] : null,
        ]);
    }

    public function submitQuiz(Request $request, LearningModule $learningModule): JsonResponse
    {
        $questions = $learningModule->questions()->get();

        if ($questions->isEmpty()) {
            return response()->json(['message' => 'This lesson has no quiz yet.'], 422);
        }

        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['nullable', 'integer', 'min:0'],
        ]);
        $answers = $validated['answers'];

        $score = $questions->filter(
            fn ($q) => isset($answers[$q->id]) && (int) $answers[$q->id] === (int) $q->answer
        )->count();

        $total = $questions->count();
        $passed = ($score / $total) * 100 >= self::PASS_MARK;

        $user = $request->user();

        QuizResult::create([
            'user_id' => $user->id,
            'learning_module_id' => $learningModule->id,
            'score' => $score,
            'total' => $total,
            'remarks' => $passed ? 'Passed' : 'Failed',
        ]);

        $existing = $user->learningModules()->find($learningModule->id)?->pivot;
        $wasCompleted = $existing && $existing->completed_at;

        $user->learningModules()->syncWithoutDetaching([
            $learningModule->id => [
                'progress' => ($passed || $wasCompleted) ? 100 : max((int) ($existing->progress ?? 0), 50),
                'completed_at' => $passed ? ($existing->completed_at ?? now()) : ($existing->completed_at ?? null),
            ],
        ]);

        if ($passed && ! $wasCompleted) {
            ActivityLog::record(
                $user->username ?? $user->name,
                "Completed \"{$learningModule->title}\"",
                'book-open',
            );
        }

        return response()->json([
            'score' => $score,
            'total' => $total,
            'passed' => $passed,
            'remarks' => $passed ? 'Passed' : 'Failed',
        ]);
    }

    public function progress(Request $request): JsonResponse
    {
        $user = $request->user();
        $mine = $user->learningModules()->get()->keyBy('id');

        $best = $user->quizResults()->get()
            ->groupBy('learning_module_id')
            ->map(fn ($group) => $group->sortByDesc('score')->first());

        $rows = LearningModule::orderBy('id')->get()->map(function (LearningModule $m) use ($mine, $best) {
            $pivot = optional($mine->get($m->id))->pivot;
            $progress = (int) ($pivot->progress ?? 0);
            $result = $best->get($m->id);

            return [
                'id' => $m->id,
                'title' => $m->title,
                'module' => $m->module ?? 'Language',
                'difficulty' => $m->difficulty ?? 'Beginner',
                'progress' => $progress,
                'status' => $this->moduleStatus($progress, $pivot->completed_at ?? null),
                'score' => $result ? "{$result->score}/{$result->total}" : null,
                'completedAt' => ($pivot && $pivot->completed_at)
                    ? Carbon::parse($pivot->completed_at)->format('M j, Y')
                    : null,
            ];
        });

        return response()->json([
            'rows' => $rows->values(),
            'stats' => [
                'completed' => $rows->where('status', 'Completed')->count(),
                'inProgress' => $rows->where('status', 'In Progress')->count(),
                'total' => $rows->count(),
                'quizzesTaken' => $user->quizResults()->count(),
            ],
        ]);
    }

    private function moduleStatus(int $progress, $completedAt): string
    {
        if ($completedAt) {
            return 'Completed';
        }

        return $progress > 0 ? 'In Progress' : 'Not Started';
    }
}
