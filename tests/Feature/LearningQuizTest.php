<?php

namespace Tests\Feature;

use App\Models\LearningModule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningQuizTest extends TestCase
{
    use RefreshDatabase;

    private function moduleWithTwoQuestions(): LearningModule
    {
        $module = LearningModule::create([
            'title' => 'Test Lesson',
            'module' => 'Language',
            'difficulty' => 'Beginner',
            'content' => 'Lesson body.',
        ]);
        $module->questions()->create(['question' => 'Q1', 'options' => ['right', 'wrong'], 'answer' => 0, 'order' => 1]);
        $module->questions()->create(['question' => 'Q2', 'options' => ['wrong', 'right'], 'answer' => 1, 'order' => 2]);

        return $module;
    }

    public function test_passing_a_quiz_records_a_passed_result_and_completes_the_lesson(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $module = $this->moduleWithTwoQuestions();
        [$q1, $q2] = $module->questions()->get()->all();

        $this->actingAs($learner)
            ->post("/user/learning-modules/{$module->id}/quiz", ['answers' => [$q1->id => 0, $q2->id => 1]])
            ->assertRedirect("/user/learning-modules/{$module->id}");

        $this->assertDatabaseHas('quiz_results', [
            'user_id' => $learner->id,
            'learning_module_id' => $module->id,
            'score' => 2,
            'total' => 2,
            'remarks' => 'Passed',
        ]);

        $pivot = $learner->fresh()->learningModules()->first()->pivot;
        $this->assertSame(100, (int) $pivot->progress);
        $this->assertNotNull($pivot->completed_at);
    }

    public function test_failing_a_quiz_records_a_failed_result_and_does_not_complete(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $module = $this->moduleWithTwoQuestions();
        [$q1, $q2] = $module->questions()->get()->all();

        // Both wrong → 0% → Failed.
        $this->actingAs($learner)
            ->post("/user/learning-modules/{$module->id}/quiz", ['answers' => [$q1->id => 1, $q2->id => 0]]);

        $this->assertDatabaseHas('quiz_results', [
            'user_id' => $learner->id,
            'learning_module_id' => $module->id,
            'score' => 0,
            'remarks' => 'Failed',
        ]);

        $pivot = $learner->fresh()->learningModules()->first()->pivot;
        $this->assertNull($pivot->completed_at);
    }

    public function test_failing_a_retake_does_not_undo_a_completed_lesson(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $module = $this->moduleWithTwoQuestions();
        [$q1, $q2] = $module->questions()->get()->all();

        // First attempt passes and completes the lesson.
        $this->actingAs($learner)->post("/user/learning-modules/{$module->id}/quiz", ['answers' => [$q1->id => 0, $q2->id => 1]]);
        // Retake and fail — completion must be preserved.
        $this->actingAs($learner)->post("/user/learning-modules/{$module->id}/quiz", ['answers' => [$q1->id => 1, $q2->id => 0]]);

        $pivot = $learner->fresh()->learningModules()->first()->pivot;
        $this->assertSame(100, (int) $pivot->progress);
        $this->assertNotNull($pivot->completed_at);
        // Both attempts are still recorded.
        $this->assertSame(2, \App\Models\QuizResult::where('user_id', $learner->id)->count());
    }
}
