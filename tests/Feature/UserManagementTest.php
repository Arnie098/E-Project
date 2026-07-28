<?php

namespace Tests\Feature;

use App\Models\Contribution;
use App\Models\ResourceVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_can_change_a_learners_role(): void
    {
        $super = User::factory()->create(['role' => 'super']);
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($super)->patch("/super/users/{$learner->id}", ['role' => 'admin', 'status' => 'Active']);

        $this->assertSame('admin', $learner->fresh()->role);
    }

    public function test_super_cannot_demote_their_own_role(): void
    {
        $super = User::factory()->create(['role' => 'super']);

        $this->actingAs($super)->patch("/super/users/{$super->id}", ['role' => 'learner', 'status' => 'Active']);

        $this->assertSame('super', $super->fresh()->role);
    }

    public function test_super_cannot_delete_their_own_account(): void
    {
        $super = User::factory()->create(['role' => 'super']);

        $this->actingAs($super)->delete("/super/users/{$super->id}");

        $this->assertDatabaseHas('users', ['id' => $super->id]);
    }

    public function test_admin_can_deactivate_a_learner_but_not_another_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $learner = User::factory()->create(['role' => 'learner', 'status' => 'Active']);
        $otherAdmin = User::factory()->create(['role' => 'admin', 'status' => 'Active']);

        $this->actingAs($admin)->patch("/admin/users/{$learner->id}/status");
        $this->assertSame('Inactive', $learner->fresh()->status);

        $this->actingAs($admin)->patch("/admin/users/{$otherAdmin->id}/status");
        $this->assertSame('Active', $otherAdmin->fresh()->status);
    }

    public function test_approving_a_contribution_records_a_verification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $contribution = Contribution::create([
            'contributor_name' => 'Ana',
            'item' => 'A story',
            'type' => 'Story',
            'status' => 'Pending',
        ]);

        $this->actingAs($admin)->patch("/admin/contributions/{$contribution->id}", [
            'contributor_name' => 'Ana',
            'item' => 'A story',
            'type' => 'Story',
            'status' => 'Approved',
        ]);

        $this->assertSame('Approved', $contribution->fresh()->status);
        $this->assertDatabaseHas('resource_verifications', [
            'contribution_id' => $contribution->id,
            'verified_by' => $admin->id,
            'status' => 'Approved',
        ]);
        $this->assertSame(1, ResourceVerification::count());
    }
}
