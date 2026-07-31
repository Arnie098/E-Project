<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceModeTest extends TestCase
{
    use RefreshDatabase;

    public function test_maintenance_mode_blocks_learners_but_not_admins(): void
    {
        Setting::set('maintenance_mode', '1');

        $learner = User::factory()->create(['role' => 'learner']);
        $admin = User::factory()->create(['role' => 'admin']);

        // Learner is served the 503 maintenance page.
        $this->actingAs($learner)->get('/user/learning-modules')->assertStatus(503);

        // Admin area is unaffected.
        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_learners_have_access_when_maintenance_is_off(): void
    {
        Setting::set('maintenance_mode', '0');

        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)->get('/user/learning-modules')->assertOk();
    }

    public function test_super_can_toggle_maintenance_mode(): void
    {
        $super = User::factory()->create(['role' => 'super']);

        $this->actingAs($super)
            ->patch('/super/settings', ['siteName' => 'MANAYUN BAGOBO', 'tagline' => 'Test', 'maintenance' => true])
            ->assertRedirect();

        $this->assertSame('1', Setting::get('maintenance_mode'));
        $this->assertSame('MANAYUN BAGOBO', Setting::get('site_name'));
    }
}
