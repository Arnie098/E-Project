<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_are_redirected_to_their_role_home()
    {
        $this->actingAs($user = User::factory()->create());

        // /dashboard is a convenience redirect to the user's role home.
        $this->get('/dashboard')->assertRedirect('/user');
    }
}
