<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_protected_areas(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/super')->assertRedirect('/login');
    }

    public function test_learner_cannot_access_admin_or_super_areas(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)->get('/admin')->assertForbidden();
        $this->actingAs($learner)->get('/super')->assertForbidden();
    }

    public function test_admin_can_access_admin_but_not_super(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin')->assertOk();
        $this->actingAs($admin)->get('/super')->assertForbidden();
    }

    public function test_super_can_access_every_area(): void
    {
        $super = User::factory()->create(['role' => 'super']);

        $this->actingAs($super)->get('/admin')->assertOk();
        $this->actingAs($super)->get('/super')->assertOk();
    }
}
