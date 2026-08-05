<?php

use App\Http\Controllers\AdminCrudController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AiChatbotController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\SuperDashboardController;
use App\Http\Controllers\UserDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');

/*
 * Convenience redirect: after login users land on their role home. Keeps any
 * stray link to /dashboard working.
 */
Route::get('/dashboard', function () {
    return redirect(auth()->user()?->homePath() ?? '/login');
})->middleware('auth')->name('dashboard');

/* ---------------- Learner ---------------- */
Route::middleware(['auth', \App\Http\Middleware\EnsureNotUnderMaintenance::class])->group(function () {
    Route::get('/user', [UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::get('/user/settings', [UserDashboardController::class, 'settings'])->name('user.settings');
    Route::patch('/user/settings', [UserDashboardController::class, 'updateSettings'])->name('user.settings.update');
    Route::get('/user/multimedia-gallery', [UserDashboardController::class, 'multimediaGallery'])->name('user.multimedia');
    Route::get('/user/storytelling-archive', [UserDashboardController::class, 'storytellingArchive'])->name('user.storytelling');
    Route::get('/user/vocabulary-dictionary', [UserDashboardController::class, 'vocabularyDictionary'])->name('user.vocabulary');
    Route::get('/user/ai-chatbot', [AiChatbotController::class, 'index'])->name('user.ai-chatbot');
    Route::post('/user/ai-chatbot', [AiChatbotController::class, 'chat'])->name('user.ai-chatbot.send');
    Route::post('/user/ai-chatbot/attachments', [AiChatbotController::class, 'uploadAttachment'])->name('user.ai-chatbot.attachment.store');
    Route::get('/user/ai-chatbot/attachments/{attachment}', [AiChatbotController::class, 'attachment'])->name('user.ai-chatbot.attachment');
    Route::get('/user/ai-chatbot/conversations', [AiChatbotController::class, 'conversations'])->name('user.ai-chatbot.conversations');
    Route::get('/user/ai-chatbot/conversations/{conversation}', [AiChatbotController::class, 'conversation'])->name('user.ai-chatbot.conversation');
    Route::delete('/user/ai-chatbot/conversations/{conversation}', [AiChatbotController::class, 'destroyConversation'])->name('user.ai-chatbot.conversation.destroy');

    Route::get('/user/learning-modules', [LearningController::class, 'index'])->name('user.learning-modules');
    Route::get('/user/learning-modules/{learningModule}', [LearningController::class, 'show'])->name('user.learning-module');
    Route::post('/user/learning-modules/{learningModule}/quiz', [LearningController::class, 'submitQuiz'])->name('user.learning-module.quiz');
    Route::get('/user/progress', [LearningController::class, 'progress'])->name('user.progress');

    Route::get('/user/community-contributions', [CommunityController::class, 'contributions'])->name('user.community-contributions');
    Route::post('/user/community-contributions', [CommunityController::class, 'storeContribution'])->name('user.community-contributions.store');
    Route::get('/user/feedback', [CommunityController::class, 'feedback'])->name('user.feedback');
    Route::post('/user/feedback', [CommunityController::class, 'storeFeedback'])->name('user.feedback.store');

    Route::get('/user/cultural-repository', [UserDashboardController::class, 'culturalRepository'])->name('user.cultural-repository');
    Route::get('/user/events', [UserDashboardController::class, 'events'])->name('user.events');
});

/* ---------------- Admin ---------------- */
Route::middleware(['auth', 'role:admin,super'])->group(function () {
    Route::get('/admin', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/learning-materials', [AdminCrudController::class, 'learningMaterials'])->name('admin.learning-materials');
    Route::post('/admin/learning-materials', [AdminCrudController::class, 'storeLearningMaterial'])->name('admin.learning-materials.store');
    Route::patch('/admin/learning-materials/{learningModule}', [AdminCrudController::class, 'updateLearningMaterial'])->name('admin.learning-materials.update');
    Route::delete('/admin/learning-materials/{learningModule}', [AdminCrudController::class, 'destroyLearningMaterial'])->name('admin.learning-materials.destroy');

    Route::get('/admin/learning-materials/{learningModule}/quiz', [AdminCrudController::class, 'lessonQuiz'])->name('admin.learning-materials.quiz');
    Route::post('/admin/learning-materials/{learningModule}/questions', [AdminCrudController::class, 'storeQuestion'])->name('admin.questions.store');
    Route::patch('/admin/questions/{quizQuestion}', [AdminCrudController::class, 'updateQuestion'])->name('admin.questions.update');
    Route::delete('/admin/questions/{quizQuestion}', [AdminCrudController::class, 'destroyQuestion'])->name('admin.questions.destroy');

    Route::get('/admin/cultural-repository', [AdminCrudController::class, 'repositoryItems'])->name('admin.cultural-repository');
    Route::post('/admin/cultural-repository', [AdminCrudController::class, 'storeRepositoryItem'])->name('admin.cultural-repository.store');
    Route::patch('/admin/cultural-repository/{repositoryItem}', [AdminCrudController::class, 'updateRepositoryItem'])->name('admin.cultural-repository.update');
    Route::delete('/admin/cultural-repository/{repositoryItem}', [AdminCrudController::class, 'destroyRepositoryItem'])->name('admin.cultural-repository.destroy');

    Route::get('/admin/contributions', [AdminCrudController::class, 'contributions'])->name('admin.contributions');
    Route::post('/admin/contributions', [AdminCrudController::class, 'storeContribution'])->name('admin.contributions.store');
    Route::patch('/admin/contributions/{contribution}', [AdminCrudController::class, 'updateContribution'])->name('admin.contributions.update');
    Route::delete('/admin/contributions/{contribution}', [AdminCrudController::class, 'destroyContribution'])->name('admin.contributions.destroy');

    Route::get('/admin/feedback', [AdminCrudController::class, 'feedback'])->name('admin.feedback');
    Route::post('/admin/feedback', [AdminCrudController::class, 'storeFeedback'])->name('admin.feedback.store');
    Route::patch('/admin/feedback/{feedbackItem}', [AdminCrudController::class, 'updateFeedback'])->name('admin.feedback.update');
    Route::delete('/admin/feedback/{feedbackItem}', [AdminCrudController::class, 'destroyFeedback'])->name('admin.feedback.destroy');

    Route::get('/admin/events', [AdminCrudController::class, 'events'])->name('admin.events');
    Route::post('/admin/events', [AdminCrudController::class, 'storeEvent'])->name('admin.events.store');
    Route::patch('/admin/events/{event}', [AdminCrudController::class, 'updateEvent'])->name('admin.events.update');
    Route::delete('/admin/events/{event}', [AdminCrudController::class, 'destroyEvent'])->name('admin.events.destroy');

    Route::get('/admin/reports', [AdminDashboardController::class, 'reports'])->name('admin.reports');

    Route::get('/admin/users', [AdminDashboardController::class, 'users'])->name('admin.users');
    Route::patch('/admin/users/{user}/status', [AdminDashboardController::class, 'toggleUserStatus'])->name('admin.users.status');

    Route::get('/admin/multimedia', [AdminCrudController::class, 'multimedia'])->name('admin.multimedia');
    Route::post('/admin/multimedia', [AdminCrudController::class, 'storeMedia'])->name('admin.multimedia.store');
    Route::patch('/admin/multimedia/{mediaItem}', [AdminCrudController::class, 'updateMedia'])->name('admin.multimedia.update');
    Route::delete('/admin/multimedia/{mediaItem}', [AdminCrudController::class, 'destroyMedia'])->name('admin.multimedia.destroy');

    foreach ([
        'settings',
    ] as $segment) {
        Route::get("/admin/{$segment}", fn () => Inertia::render("admin/{$segment}"))->name("admin.{$segment}");
    }
});

/* ---------------- Super Admin ---------------- */
Route::middleware(['auth', 'role:super'])->group(function () {
    Route::get('/super', [SuperDashboardController::class, 'index'])->name('super.dashboard');

    Route::get('/super/overview', [SuperDashboardController::class, 'overview'])->name('super.overview');
    Route::get('/super/users', [SuperDashboardController::class, 'users'])->name('super.users');
    Route::patch('/super/users/{user}', [SuperDashboardController::class, 'updateUser'])->name('super.users.update');
    Route::delete('/super/users/{user}', [SuperDashboardController::class, 'destroyUser'])->name('super.users.destroy');
    Route::get('/super/logs', [SuperDashboardController::class, 'logs'])->name('super.logs');
    Route::get('/super/roles', [SuperDashboardController::class, 'roles'])->name('super.roles');
    Route::get('/super/content', [SuperDashboardController::class, 'content'])->name('super.content');
    Route::get('/super/reports', [SuperDashboardController::class, 'reports'])->name('super.reports');
    Route::get('/super/settings', [SuperDashboardController::class, 'settings'])->name('super.settings');
    Route::patch('/super/settings', [SuperDashboardController::class, 'updateSettings'])->name('super.settings.update');

    foreach ([
        'database',
        'backup', 'security', 'site', 'maintenance', 'subscription',
    ] as $segment) {
        Route::get("/super/{$segment}", fn () => Inertia::render("super/{$segment}"))->name("super.{$segment}");
    }
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
