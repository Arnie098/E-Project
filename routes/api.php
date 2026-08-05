<?php

use App\Http\Controllers\AiChatbotController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\TranslationController;
use Illuminate\Support\Facades\Route;

/*
 | Public endpoints for the mobile app (React Native / Expo).
 | Token auth is handled by Laravel Sanctum personal access tokens.
 */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

Route::middleware('auth:sanctum')->group(function () {
    // Account
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Content
    Route::get('/dashboard', [ContentController::class, 'dashboard']);
    Route::get('/vocabulary', [ContentController::class, 'vocabulary']);
    Route::get('/stories', [ContentController::class, 'stories']);
    Route::get('/media', [ContentController::class, 'media']);
    Route::get('/events', [ContentController::class, 'events']);
    Route::get('/repository', [ContentController::class, 'repository']);

    // Learning
    Route::get('/learning-modules', [ContentController::class, 'modules']);
    Route::get('/learning-modules/{learningModule}', [ContentController::class, 'module']);
    Route::post('/learning-modules/{learningModule}/quiz', [ContentController::class, 'submitQuiz']);
    Route::get('/progress', [ContentController::class, 'progress']);

    // Community
    Route::get('/contributions', [CommunityController::class, 'contributions']);
    Route::post('/contributions', [CommunityController::class, 'storeContribution']);
    Route::get('/feedback', [CommunityController::class, 'feedback']);
    Route::post('/feedback', [CommunityController::class, 'storeFeedback']);

    // Voice / text translation into Bagobo Tagabawa (English or Tagalog source)
    Route::post('/translate', [TranslationController::class, 'translate']);

    // AI chatbot (reuses the web controller's full scope-gated reply logic)
    Route::post('/chatbot', [AiChatbotController::class, 'chat']);
    Route::post('/chatbot/attachments', [AiChatbotController::class, 'uploadAttachment']);
    Route::get('/chatbot/attachments/{attachment}', [AiChatbotController::class, 'attachment'])
        ->name('api.chatbot.attachment');
    Route::get('/chatbot/conversations', [ChatbotController::class, 'conversations']);
    Route::get('/chatbot/conversations/{conversation}', [ChatbotController::class, 'conversation']);
    Route::delete('/chatbot/conversations/{conversation}', [ChatbotController::class, 'destroyConversation']);
});
