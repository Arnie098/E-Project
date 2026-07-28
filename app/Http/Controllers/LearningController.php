<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LearningModule;
use App\Models\QuizResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    private const PASS_MARK = 60; // percent

    public function index(Request $request): Response
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
                'status' => $this->status($progress, $pivot->completed_at ?? null),
            ];
        });

        return Inertia::render('user/learning-modules', [
            'modules' => $modules->values(),
            'stats' => [
                'total' => $modules->count(),
                'completed' => $modules->where('status', 'Completed')->count(),
                'inProgress' => $modules->where('status', 'In Progress')->count(),
            ],
        ]);
    }

    public function show(Request $request, LearningModule $learningModule): Response
    {
        $user = $request->user();
        $pivot = optional($user->learningModules()->find($learningModule->id))->pivot;
        $result = $user->quizResults()->where('learning_module_id', $learningModule->id)->latest()->first();

        return Inertia::render('user/learning-module', [
            'module' => [
                'id' => $learningModule->id,
                'title' => $learningModule->title,
                'description' => $learningModule->description,
                'module' => $learningModule->module ?? 'Language',
                'difficulty' => $learningModule->difficulty ?? 'Beginner',
                'content' => $learningModule->content,
                'progress' => (int) ($pivot->progress ?? 0),
                'status' => $this->status((int) ($pivot->progress ?? 0), $pivot->completed_at ?? null),
            ],
            // Never send the correct answer to the client.
            'questions' => $learningModule->questions()->get()->map(fn ($q) => [
                'id' => $q->id,
                'question' => $q->question,
                'options' => $q->options,
            ]),
            'result' => $result ? [
                'score' => $result->score,
                'total' => $result->total,
                'remarks' => $result->remarks,
                'takenAt' => $result->created_at->format('M j, Y'),
            ] : null,
        ]);
    }

    public function submitQuiz(Request $request, LearningModule $learningModule): RedirectResponse
    {
        $questions = $learningModule->questions()->get();

        if ($questions->isEmpty()) {
            return back()->with('status', 'This lesson has no quiz yet.');
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

        QuizResult::create([
            'user_id' => $request->user()->id,
            'learning_module_id' => $learningModule->id,
            'score' => $score,
            'total' => $total,
            'remarks' => $passed ? 'Passed' : 'Failed',
        ]);

        // A passed quiz completes the lesson; a failed attempt still counts as
        // started — but never regress progress or un-complete a lesson the learner
        // has already passed on a previous attempt.
        $existing = $request->user()->learningModules()->find($learningModule->id)?->pivot;
        $wasCompleted = $existing && $existing->completed_at;

        $request->user()->learningModules()->syncWithoutDetaching([
            $learningModule->id => [
                'progress' => ($passed || $wasCompleted) ? 100 : max((int) ($existing->progress ?? 0), 50),
                'completed_at' => $passed ? ($existing->completed_at ?? now()) : ($existing->completed_at ?? null),
            ],
        ]);

        if ($passed && ! $wasCompleted) {
            ActivityLog::record(
                $request->user()->username ?? $request->user()->name,
                "Completed \"{$learningModule->title}\"",
                'book-open',
            );
        }

        return redirect()
            ->route('user.learning-module', $learningModule)
            ->with('status', $passed
                ? "Great work — you scored {$score}/{$total} and completed this lesson!"
                : "You scored {$score}/{$total}. Review the lesson and try again.");
    }

    public function progress(Request $request): Response
    {
        $user = $request->user();
        $mine = $user->learningModules()->get()->keyBy('id');

        // Best score per module.
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
                'status' => $this->status($progress, $pivot->completed_at ?? null),
                'score' => $result ? "{$result->score}/{$result->total}" : null,
                'completedAt' => ($pivot && $pivot->completed_at)
                    ? Carbon::parse($pivot->completed_at)->format('M j, Y')
                    : null,
            ];
        });

        return Inertia::render('user/progress', [
            'rows' => $rows->values(),
            'stats' => [
                'completed' => $rows->where('status', 'Completed')->count(),
                'inProgress' => $rows->where('status', 'In Progress')->count(),
                'total' => $rows->count(),
                'quizzesTaken' => $user->quizResults()->count(),
            ],
        ]);
    }

    private function status(int $progress, $completedAt): string
    {
        if ($completedAt) {
            return 'Completed';
        }

        return $progress > 0 ? 'In Progress' : 'Not Started';
    }
}
