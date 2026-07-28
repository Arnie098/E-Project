<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunitySubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_learner_can_submit_a_contribution_as_pending(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)
            ->post('/user/community-contributions', [
                'item' => 'Bagobo harvest song',
                'type' => 'Audio',
                'description' => 'A recording from the community.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('contributions', [
            'user_id' => $learner->id,
            'item' => 'Bagobo harvest song',
            'type' => 'Audio',
            'status' => 'Pending',
        ]);
    }

    public function test_contribution_type_must_be_valid(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)
            ->post('/user/community-contributions', ['item' => 'X', 'type' => 'Nonsense'])
            ->assertSessionHasErrors('type');
    }

    public function test_learner_can_submit_feedback_with_a_rating(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)
            ->post('/user/feedback', ['subject' => 'Great platform', 'body' => 'Really useful.', 'rating' => 5])
            ->assertRedirect();

        $this->assertDatabaseHas('feedback', [
            'user_id' => $learner->id,
            'subject' => 'Great platform',
            'rating' => 5,
            'status' => 'Open',
        ]);
    }

    public function test_feedback_rating_is_bounded(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)
            ->post('/user/feedback', ['subject' => 'X', 'body' => 'Y', 'rating' => 9])
            ->assertSessionHasErrors('rating');
    }
}
