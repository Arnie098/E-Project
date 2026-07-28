<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Contribution;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\QuizQuestion;
use App\Models\RepositoryItem;
use App\Models\ResourceVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCrudController extends Controller
{
    public function learningMaterials(): Response
    {
        return Inertia::render('admin/learning-materials', [
            'items' => LearningModule::withCount('questions')->latest()->get()->map(fn (LearningModule $module) => [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'category' => $module->category,
                'module' => $module->module,
                'difficulty' => $module->difficulty,
                'content' => $module->content,
                'image' => $module->image,
                'questions' => $module->questions_count,
                'updatedAt' => $module->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'Total Lessons', 'value' => (string) LearningModule::count()],
                ['label' => 'Quiz Questions', 'value' => (string) QuizQuestion::count()],
                ['label' => 'Updated This Week', 'value' => (string) LearningModule::where('updated_at', '>=', now()->subWeek())->count()],
            ],
        ]);
    }

    public function lessonQuiz(LearningModule $learningModule): Response
    {
        return Inertia::render('admin/learning-material-quiz', [
            'module' => [
                'id' => $learningModule->id,
                'title' => $learningModule->title,
                'module' => $learningModule->module,
                'difficulty' => $learningModule->difficulty,
            ],
            // Admin authoring needs the correct answer, unlike the learner view.
            'questions' => $learningModule->questions()->get()->map(fn (QuizQuestion $q) => [
                'id' => $q->id,
                'question' => $q->question,
                'options' => $q->options,
                'answer' => $q->answer,
            ]),
        ]);
    }

    public function storeQuestion(Request $request, LearningModule $learningModule): RedirectResponse
    {
        $validated = $this->validateQuestion($request, count($request->input('options', [])));

        $learningModule->questions()->create([
            'question' => $validated['question'],
            'options' => array_values($validated['options']),
            'answer' => $validated['answer'],
            'order' => (int) $learningModule->questions()->max('order') + 1,
        ]);

        return back()->with('status', 'Question added.');
    }

    public function updateQuestion(Request $request, QuizQuestion $quizQuestion): RedirectResponse
    {
        $validated = $this->validateQuestion($request, count($request->input('options', [])));

        $quizQuestion->update([
            'question' => $validated['question'],
            'options' => array_values($validated['options']),
            'answer' => $validated['answer'],
        ]);

        return back()->with('status', 'Question updated.');
    }

    public function destroyQuestion(QuizQuestion $quizQuestion): RedirectResponse
    {
        $quizQuestion->delete();

        return back()->with('status', 'Question deleted.');
    }

    private function validateQuestion(Request $request, int $optionCount): array
    {
        return $request->validate([
            'question' => 'required|string|max:500',
            'options' => 'required|array|min:2|max:6',
            'options.*' => 'required|string|max:255',
            'answer' => ['required', 'integer', 'min:0', 'max:'.max($optionCount - 1, 0)],
        ]);
    }

    public function storeLearningMaterial(Request $request): RedirectResponse
    {
        LearningModule::create($this->validateLearningMaterial($request));

        return back()->with('status', 'Learning material created.');
    }

    public function updateLearningMaterial(Request $request, LearningModule $learningModule): RedirectResponse
    {
        $learningModule->update($this->validateLearningMaterial($request));

        return back()->with('status', 'Learning material updated.');
    }

    public function destroyLearningMaterial(LearningModule $learningModule): RedirectResponse
    {
        $learningModule->delete();

        return back()->with('status', 'Learning material deleted.');
    }

    public function repositoryItems(): Response
    {
        return Inertia::render('admin/cultural-repository', [
            'items' => RepositoryItem::latest()->get()->map(fn (RepositoryItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'category' => $item->category,
                'type' => $item->type,
                'description' => $item->description,
                'media' => $item->media,
                'updatedAt' => $item->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'Repository Items', 'value' => (string) RepositoryItem::count()],
                ['label' => 'Image Entries', 'value' => (string) RepositoryItem::where('type', 'Image')->count()],
                ['label' => 'Updated This Week', 'value' => (string) RepositoryItem::where('updated_at', '>=', now()->subWeek())->count()],
            ],
        ]);
    }

    public function storeRepositoryItem(Request $request): RedirectResponse
    {
        RepositoryItem::create($this->validateRepositoryItem($request));

        return back()->with('status', 'Repository item created.');
    }

    public function updateRepositoryItem(Request $request, RepositoryItem $repositoryItem): RedirectResponse
    {
        $repositoryItem->update($this->validateRepositoryItem($request));

        return back()->with('status', 'Repository item updated.');
    }

    public function destroyRepositoryItem(RepositoryItem $repositoryItem): RedirectResponse
    {
        $repositoryItem->delete();

        return back()->with('status', 'Repository item deleted.');
    }

    public function contributions(): Response
    {
        return Inertia::render('admin/contributions', [
            'items' => Contribution::latest()->get()->map(fn (Contribution $contribution) => [
                'id' => $contribution->id,
                'contributorName' => $contribution->contributor_name,
                'item' => $contribution->item,
                'type' => $contribution->type,
                'status' => $contribution->status,
                'updatedAt' => $contribution->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'All Submissions', 'value' => (string) Contribution::count()],
                ['label' => 'Pending Review', 'value' => (string) Contribution::where('status', 'Pending')->count()],
                ['label' => 'Approved', 'value' => (string) Contribution::where('status', 'Approved')->count()],
            ],
        ]);
    }

    public function storeContribution(Request $request): RedirectResponse
    {
        Contribution::create($this->validateContribution($request));

        return back()->with('status', 'Contribution created.');
    }

    public function updateContribution(Request $request, Contribution $contribution): RedirectResponse
    {
        $wasStatus = $contribution->status;
        $contribution->update($this->validateContribution($request));

        // Record a verification when an admin approves or rejects a submission
        // (Resource Verification, Table 32) and log it to the audit trail.
        if (in_array($contribution->status, ['Approved', 'Rejected'], true) && $contribution->status !== $wasStatus) {
            $admin = $request->user();

            ResourceVerification::create([
                'contribution_id' => $contribution->id,
                'verified_by' => $admin->id,
                'status' => $contribution->status,
                'remarks' => $request->string('remarks')->toString() ?: null,
                'verified_at' => now(),
            ]);

            ActivityLog::record(
                $admin->username ?? $admin->name,
                "{$contribution->status} contribution: {$contribution->item}",
                'shield-check',
            );
        }

        return back()->with('status', 'Contribution updated.');
    }

    public function destroyContribution(Contribution $contribution): RedirectResponse
    {
        $contribution->delete();

        return back()->with('status', 'Contribution deleted.');
    }

    public function feedback(): Response
    {
        return Inertia::render('admin/feedback', [
            'items' => Feedback::latest()->get()->map(fn (Feedback $feedback) => [
                'id' => $feedback->id,
                'subject' => $feedback->subject,
                'body' => $feedback->body,
                'status' => $feedback->status,
                'user' => $feedback->user?->name,
                'updatedAt' => $feedback->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'Feedback Entries', 'value' => (string) Feedback::count()],
                ['label' => 'Open Cases', 'value' => (string) Feedback::where('status', 'Open')->count()],
                ['label' => 'Closed Cases', 'value' => (string) Feedback::where('status', 'Closed')->count()],
            ],
        ]);
    }

    public function storeFeedback(Request $request): RedirectResponse
    {
        Feedback::create($this->validateFeedback($request));

        return back()->with('status', 'Feedback created.');
    }

    public function updateFeedback(Request $request, Feedback $feedbackItem): RedirectResponse
    {
        $feedbackItem->update($this->validateFeedback($request));

        return back()->with('status', 'Feedback updated.');
    }

    public function destroyFeedback(Feedback $feedbackItem): RedirectResponse
    {
        $feedbackItem->delete();

        return back()->with('status', 'Feedback deleted.');
    }

    public function events(): Response
    {
        return Inertia::render('admin/events', [
            'items' => Event::orderBy('starts_at')->get()->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'startsAt' => optional($event->starts_at)->format('Y-m-d\TH:i'),
                'startsAtLabel' => optional($event->starts_at)->format('M j, Y g:i A'),
                'location' => $event->location,
                'updatedAt' => $event->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'Upcoming Events', 'value' => (string) Event::where('starts_at', '>=', now())->count()],
                ['label' => 'Past Events', 'value' => (string) Event::where('starts_at', '<', now())->count()],
                ['label' => 'This Month', 'value' => (string) Event::whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()])->count()],
            ],
        ]);
    }

    public function storeEvent(Request $request): RedirectResponse
    {
        Event::create($this->validateEvent($request));

        return back()->with('status', 'Event created.');
    }

    public function updateEvent(Request $request, Event $event): RedirectResponse
    {
        $event->update($this->validateEvent($request));

        return back()->with('status', 'Event updated.');
    }

    public function destroyEvent(Event $event): RedirectResponse
    {
        $event->delete();

        return back()->with('status', 'Event deleted.');
    }

    public function multimedia(): Response
    {
        return Inertia::render('admin/multimedia', [
            'items' => MediaItem::latest()->get()->map(fn (MediaItem $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'category' => $m->category,
                'media_type' => $m->media_type,
                'duration' => $m->duration,
                'thumbnail' => $m->thumbnail,
                'updatedAt' => $m->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'Total Media', 'value' => (string) MediaItem::count()],
                ['label' => 'Videos', 'value' => (string) MediaItem::where('media_type', 'video')->count()],
                ['label' => 'Audio', 'value' => (string) MediaItem::where('media_type', 'audio')->count()],
            ],
        ]);
    }

    public function storeMedia(Request $request): RedirectResponse
    {
        MediaItem::create($this->validateMedia($request) + ['published_at' => now(), 'views' => 0]);

        return back()->with('status', 'Media item created.');
    }

    public function updateMedia(Request $request, MediaItem $mediaItem): RedirectResponse
    {
        $mediaItem->update($this->validateMedia($request));

        return back()->with('status', 'Media item updated.');
    }

    public function destroyMedia(MediaItem $mediaItem): RedirectResponse
    {
        $mediaItem->delete();

        return back()->with('status', 'Media item deleted.');
    }

    private function validateMedia(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'media_type' => 'required|string|in:image,video,audio',
            'duration' => 'nullable|string|max:20',
            'thumbnail' => 'nullable|string|max:255',
        ]);
    }

    private function validateLearningMaterial(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'module' => 'nullable|string|max:255',
            'difficulty' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ]);
    }

    private function validateRepositoryItem(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media' => 'nullable|string|max:255',
        ]);
    }

    private function validateContribution(Request $request): array
    {
        return $request->validate([
            'contributor_name' => 'nullable|string|max:255',
            'item' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'status' => 'required|string|in:Pending,Approved,Rejected',
        ]);
    }

    private function validateFeedback(Request $request): array
    {
        return $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'status' => 'required|string|in:Open,In Review,Closed',
        ]);
    }

    private function validateEvent(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'starts_at' => 'required|date',
            'location' => 'nullable|string|max:255',
        ]);
    }
}
