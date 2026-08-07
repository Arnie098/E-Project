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
use App\Models\VocabularyWord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminCrudController extends Controller
{
    public function vocabulary(): Response
    {
        return Inertia::render('admin/vocabulary', [
            'items' => VocabularyWord::with('pronunciationRecord.verifier')->orderBy('word')->get()->map(fn (VocabularyWord $word) => [
                'id' => $word->id,
                'word' => $word->word,
                'meaning' => $word->meaning,
                'pronunciation' => $word->pronunciation,
                'category' => $word->category,
                'example' => $word->example,
                'audio_file' => $word->pronunciationRecord?->audio_file,
                'native_speaker' => $word->pronunciationRecord?->native_speaker,
                'verified' => $word->pronunciationRecord?->verified_at?->format('M j, Y'),
                'updatedAt' => $word->updated_at->format('M j, Y'),
            ]),
            'stats' => [
                ['label' => 'Vocabulary Words', 'value' => (string) VocabularyWord::count()],
                ['label' => 'With Audio', 'value' => (string) VocabularyWord::whereHas('pronunciationRecord', fn ($query) => $query->whereNotNull('audio_file'))->count()],
                ['label' => 'Verified Records', 'value' => (string) VocabularyWord::has('pronunciationRecord')->count()],
            ],
        ]);
    }

    public function storeVocabulary(Request $request): RedirectResponse
    {
        $data = $this->validateVocabulary($request);
        $audio = $this->storeUploadedFile($request, 'audio_file', 'pronunciations');
        unset($data['audio_file'], $data['native_speaker']);

        $word = VocabularyWord::create($data);
        $this->syncPronunciation($word, $request, $audio);
        $this->recordCrudActivity($request, 'Created vocabulary word', $word->word);

        return back()->with('status', 'Vocabulary word created.');
    }

    public function updateVocabulary(Request $request, VocabularyWord $vocabularyWord): RedirectResponse
    {
        $data = $this->validateVocabulary($request, $vocabularyWord);
        $audio = $this->storeUploadedFile($request, 'audio_file', 'pronunciations', $vocabularyWord->pronunciationRecord?->audio_file);
        unset($data['audio_file'], $data['native_speaker']);

        $vocabularyWord->update($data);
        $this->syncPronunciation($vocabularyWord, $request, $audio);
        $this->recordCrudActivity($request, 'Updated vocabulary word', $vocabularyWord->word);

        return back()->with('status', 'Vocabulary word updated.');
    }

    public function destroyVocabulary(Request $request, VocabularyWord $vocabularyWord): RedirectResponse
    {
        $word = $vocabularyWord->word;
        $this->deleteStoredFile($vocabularyWord->pronunciationRecord?->audio_file);
        $vocabularyWord->delete();
        $this->recordCrudActivity($request, 'Deleted vocabulary word', $word);

        return back()->with('status', 'Vocabulary word deleted.');
    }

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

        $this->recordCrudActivity($request, 'Created quiz question', $learningModule->title);

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

        $this->recordCrudActivity($request, 'Updated quiz question', $quizQuestion->question);

        return back()->with('status', 'Question updated.');
    }

    public function destroyQuestion(Request $request, QuizQuestion $quizQuestion): RedirectResponse
    {
        $question = $quizQuestion->question;
        $quizQuestion->delete();
        $this->recordCrudActivity($request, 'Deleted quiz question', $question);

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
        $data = $this->validateLearningMaterial($request);
        $data['image'] = $this->storeUploadedFile($request, 'image', 'lesson-images');
        $module = LearningModule::create($data);
        $this->recordCrudActivity($request, 'Created learning material', $module->title);

        return back()->with('status', 'Learning material created.');
    }

    public function updateLearningMaterial(Request $request, LearningModule $learningModule): RedirectResponse
    {
        $data = $this->validateLearningMaterial($request);
        $data['image'] = $this->storeUploadedFile($request, 'image', 'lesson-images', $learningModule->image);
        $learningModule->update(array_filter($data, fn ($value) => $value !== null));
        $this->recordCrudActivity($request, 'Updated learning material', $learningModule->title);

        return back()->with('status', 'Learning material updated.');
    }

    public function destroyLearningMaterial(Request $request, LearningModule $learningModule): RedirectResponse
    {
        $title = $learningModule->title;
        $this->deleteStoredFile($learningModule->image);
        $learningModule->delete();
        $this->recordCrudActivity($request, 'Deleted learning material', $title);

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
        $data = $this->validateRepositoryItem($request);
        $data['media'] = $this->storeUploadedFile($request, 'media', 'repository');
        $item = RepositoryItem::create($data);
        $this->recordCrudActivity($request, 'Created repository item', $item->title);

        return back()->with('status', 'Repository item created.');
    }

    public function updateRepositoryItem(Request $request, RepositoryItem $repositoryItem): RedirectResponse
    {
        $data = $this->validateRepositoryItem($request);
        $data['media'] = $this->storeUploadedFile($request, 'media', 'repository', $repositoryItem->media);
        $repositoryItem->update(array_filter($data, fn ($value) => $value !== null));
        $this->recordCrudActivity($request, 'Updated repository item', $repositoryItem->title);

        return back()->with('status', 'Repository item updated.');
    }

    public function destroyRepositoryItem(Request $request, RepositoryItem $repositoryItem): RedirectResponse
    {
        $title = $repositoryItem->title;
        $this->deleteStoredFile($repositoryItem->media);
        $repositoryItem->delete();
        $this->recordCrudActivity($request, 'Deleted repository item', $title);

        return back()->with('status', 'Repository item deleted.');
    }

    public function contributions(): Response
    {
        return Inertia::render('admin/contributions', [
            'items' => Contribution::with(['verifications' => fn ($query) => $query->latest('verified_at')])->latest()->get()->map(fn (Contribution $contribution) => [
                'id' => $contribution->id,
                'contributor_name' => $contribution->contributor_name,
                'item' => $contribution->item,
                'description' => $contribution->description,
                'type' => $contribution->type,
                'status' => $contribution->status,
                'remarks' => $contribution->verifications->first()?->remarks,
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
        $validated = $this->validateContribution($request);
        $remarks = $validated['remarks'] ?? null;
        unset($validated['remarks']);

        $contribution = Contribution::create($validated);

        if (in_array($contribution->status, ['Approved', 'Rejected'], true)) {
            $this->recordContributionVerification($contribution, $request, $remarks);
        }
        $this->recordCrudActivity($request, 'Created contribution', $contribution->item);

        return back()->with('status', 'Contribution created.');
    }

    public function updateContribution(Request $request, Contribution $contribution): RedirectResponse
    {
        $wasStatus = $contribution->status;
        $validated = $this->validateContribution($request);
        $remarks = $validated['remarks'] ?? null;
        unset($validated['remarks']);
        $contribution->update($validated);

        // Record the first decision, then keep its remarks current if the
        // submission is edited while it remains approved or rejected.
        if (in_array($contribution->status, ['Approved', 'Rejected'], true)) {
            $verification = $contribution->verifications()->latest('verified_at')->first();

            if ($contribution->status !== $wasStatus || ! $verification) {
                $this->recordContributionVerification($contribution, $request, $remarks);
            } elseif ($request->has('remarks') && $verification->remarks !== $remarks) {
                $verification->update([
                    'verified_by' => $request->user()->id,
                    'remarks' => $remarks,
                    'verified_at' => now(),
                ]);
                $this->recordCrudActivity($request, 'Updated contribution review remarks', $contribution->item);
            }
        }
        $this->recordCrudActivity($request, 'Updated contribution', $contribution->item);

        return back()->with('status', 'Contribution updated.');
    }

    public function destroyContribution(Request $request, Contribution $contribution): RedirectResponse
    {
        $item = $contribution->item;
        $contribution->delete();
        $this->recordCrudActivity($request, 'Deleted contribution', $item);

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
        $feedback = Feedback::create($this->validateFeedback($request));
        $this->recordCrudActivity($request, 'Created feedback record', $feedback->subject);

        return back()->with('status', 'Feedback created.');
    }

    public function updateFeedback(Request $request, Feedback $feedbackItem): RedirectResponse
    {
        $feedbackItem->update($this->validateFeedback($request));
        $this->recordCrudActivity($request, 'Updated feedback record', $feedbackItem->subject);

        return back()->with('status', 'Feedback updated.');
    }

    public function destroyFeedback(Request $request, Feedback $feedbackItem): RedirectResponse
    {
        $subject = $feedbackItem->subject;
        $feedbackItem->delete();
        $this->recordCrudActivity($request, 'Deleted feedback record', $subject);

        return back()->with('status', 'Feedback deleted.');
    }

    public function events(): Response
    {
        return Inertia::render('admin/events', [
            'items' => Event::orderBy('starts_at')->get()->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'starts_at' => optional($event->starts_at)->format('Y-m-d\TH:i'),
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
        $event = Event::create($this->validateEvent($request));
        $this->recordCrudActivity($request, 'Created event', $event->title);

        return back()->with('status', 'Event created.');
    }

    public function updateEvent(Request $request, Event $event): RedirectResponse
    {
        $event->update($this->validateEvent($request));
        $this->recordCrudActivity($request, 'Updated event', $event->title);

        return back()->with('status', 'Event updated.');
    }

    public function destroyEvent(Request $request, Event $event): RedirectResponse
    {
        $title = $event->title;
        $event->delete();
        $this->recordCrudActivity($request, 'Deleted event', $title);

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
                'source_file' => $m->source_file,
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
        $data = $this->validateMedia($request);
        $data['thumbnail'] = $this->storeUploadedFile($request, 'thumbnail', 'media/thumbnails');
        $data['source_file'] = $this->storeUploadedFile($request, 'source_file', 'media/files');
        $media = MediaItem::create($data + ['published_at' => now(), 'views' => 0]);
        $this->recordCrudActivity($request, 'Created multimedia item', $media->title);

        return back()->with('status', 'Media item created.');
    }

    public function updateMedia(Request $request, MediaItem $mediaItem): RedirectResponse
    {
        $data = $this->validateMedia($request);
        $data['thumbnail'] = $this->storeUploadedFile($request, 'thumbnail', 'media/thumbnails', $mediaItem->thumbnail);
        $data['source_file'] = $this->storeUploadedFile($request, 'source_file', 'media/files', $mediaItem->source_file);
        $mediaItem->update(array_filter($data, fn ($value) => $value !== null));
        $this->recordCrudActivity($request, 'Updated multimedia item', $mediaItem->title);

        return back()->with('status', 'Media item updated.');
    }

    public function destroyMedia(Request $request, MediaItem $mediaItem): RedirectResponse
    {
        $title = $mediaItem->title;
        $this->deleteStoredFile($mediaItem->thumbnail);
        $this->deleteStoredFile($mediaItem->source_file);
        $mediaItem->delete();
        $this->recordCrudActivity($request, 'Deleted multimedia item', $title);

        return back()->with('status', 'Media item deleted.');
    }

    private function validateMedia(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'media_type' => 'required|string|in:image,video,audio',
            'duration' => 'nullable|string|max:20',
            'thumbnail' => 'nullable|image|max:5120',
            'source_file' => 'nullable|file|mimes:jpg,jpeg,png,webp,gif,mp3,wav,m4a,ogg,mp4,mov,webm|max:102400',
        ]);
    }

    private function validateVocabulary(Request $request, ?VocabularyWord $word = null): array
    {
        return $request->validate([
            'word' => ['required', 'string', 'max:255', Rule::unique('vocabulary_words', 'word')->ignore($word)],
            'meaning' => 'required|string|max:255',
            'pronunciation' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'example' => 'nullable|string',
            'audio_file' => 'nullable|file|mimes:mp3,wav,m4a,ogg|max:20480',
            'native_speaker' => 'nullable|string|max:255|required_with:audio_file',
        ]);
    }

    private function syncPronunciation(VocabularyWord $word, Request $request, ?string $audio): void
    {
        $record = $word->pronunciationRecord;
        $speaker = $request->string('native_speaker')->trim()->toString();

        if (! $record && ! $audio && $speaker === '') {
            return;
        }

        $values = [
            'audio_file' => $audio ?? $record?->audio_file,
            'native_speaker' => $speaker !== '' ? $speaker : ($record?->native_speaker ?? 'Not specified'),
        ];

        if ($record) {
            $record->update($values + ['verified_by' => $request->user()->id, 'verified_at' => now()]);

            return;
        }

        $word->pronunciationRecord()->create($values + [
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
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
            'image' => 'nullable|image|max:5120',
        ]);
    }

    private function validateRepositoryItem(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,webp,gif,mp3,wav,m4a,ogg,mp4,mov,webm,pdf,doc,docx|max:102400',
        ]);
    }

    private function validateContribution(Request $request): array
    {
        return $request->validate([
            'contributor_name' => 'nullable|string|max:255',
            'item' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'type' => 'required|string|max:255',
            'status' => 'required|string|in:Pending,Approved,Rejected',
            'remarks' => 'nullable|string|max:2000',
        ]);
    }

    private function recordContributionVerification(Contribution $contribution, Request $request, ?string $remarks): void
    {
        $admin = $request->user();

        ResourceVerification::create([
            'contribution_id' => $contribution->id,
            'verified_by' => $admin->id,
            'status' => $contribution->status,
            'remarks' => $remarks,
            'verified_at' => now(),
        ]);

        ActivityLog::record(
            $admin->username ?? $admin->name,
            "{$contribution->status} contribution: {$contribution->item}",
            'shield-check',
        );
    }

    private function storeUploadedFile(Request $request, string $field, string $directory, ?string $previous = null): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }

        $path = $request->file($field)->store($directory, 'public');

        if ($previous && str_starts_with($previous, '/storage/')) {
            Storage::disk('public')->delete(substr($previous, strlen('/storage/')));
        }

        return '/storage/'.$path;
    }

    private function deleteStoredFile(?string $file): void
    {
        if ($file && str_starts_with($file, '/storage/')) {
            Storage::disk('public')->delete(substr($file, strlen('/storage/')));
        }
    }

    private function recordCrudActivity(Request $request, string $action, string $subject): void
    {
        ActivityLog::record(
            $request->user()->username ?? $request->user()->name,
            "{$action}: {$subject}",
            'file-pen',
        );
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
