<?php

namespace Tests\Feature;

use App\Models\Contribution;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\RepositoryItem;
use App\Models\ResourceVerification;
use App\Models\User;
use App\Models\VocabularyWord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
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

    public function test_admin_can_update_remarks_on_an_approved_contribution(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $contribution = Contribution::create([
            'contributor_name' => 'Ana',
            'item' => 'A story',
            'type' => 'Story',
            'status' => 'Approved',
        ]);
        ResourceVerification::create([
            'contribution_id' => $contribution->id,
            'verified_by' => $admin->id,
            'status' => 'Approved',
            'remarks' => 'Initial review',
            'verified_at' => now()->subDay(),
        ]);

        $this->actingAs($admin)->patch("/admin/contributions/{$contribution->id}", [
            'contributor_name' => 'Ana',
            'item' => 'A story',
            'type' => 'Story',
            'status' => 'Approved',
            'remarks' => 'Updated review notes',
        ])->assertSessionHasNoErrors();

        $this->assertSame(1, ResourceVerification::count());
        $this->assertSame('Updated review notes', $contribution->fresh()->verifications()->firstOrFail()->remarks);
    }

    public function test_admin_can_edit_an_event_using_the_cms_form_field_names(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $event = Event::create([
            'title' => 'Original gathering',
            'starts_at' => '2026-09-01 09:00:00',
            'location' => 'Community Hall',
        ]);

        $this->actingAs($admin)->patch("/admin/events/{$event->id}", [
            'title' => 'Updated gathering',
            'starts_at' => '2026-09-02T10:30',
            'location' => 'Cultural Center',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated gathering',
            'location' => 'Cultural Center',
        ]);
        $this->assertSame('2026-09-02 10:30:00', $event->fresh()->starts_at->format('Y-m-d H:i:s'));
    }

    public function test_admin_can_create_update_and_delete_every_content_record_type(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/learning-materials', [
            'title' => 'New lesson', 'module' => 'Language', 'difficulty' => 'Beginner',
        ])->assertSessionHasNoErrors();
        $lesson = LearningModule::where('title', 'New lesson')->firstOrFail();

        $this->post('/admin/cultural-repository', [
            'title' => 'New archive item', 'type' => 'Text',
        ])->assertSessionHasNoErrors();
        $repository = RepositoryItem::where('title', 'New archive item')->firstOrFail();

        $this->post('/admin/feedback', [
            'subject' => 'New feedback', 'body' => 'A support note.', 'status' => 'Open',
        ])->assertSessionHasNoErrors();
        $feedback = Feedback::where('subject', 'New feedback')->firstOrFail();

        $this->post('/admin/contributions', [
            'item' => 'New contribution', 'type' => 'Text', 'status' => 'Pending',
        ])->assertSessionHasNoErrors();
        $contribution = Contribution::where('item', 'New contribution')->firstOrFail();

        $this->patch("/admin/learning-materials/{$lesson->id}", [
            'title' => 'Updated lesson', 'module' => 'Culture', 'difficulty' => 'Intermediate',
        ])->assertSessionHasNoErrors();
        $this->patch("/admin/cultural-repository/{$repository->id}", [
            'title' => 'Updated archive item', 'type' => 'Document',
        ])->assertSessionHasNoErrors();
        $this->patch("/admin/feedback/{$feedback->id}", [
            'subject' => 'Updated feedback', 'body' => 'Updated support note.', 'status' => 'Closed',
        ])->assertSessionHasNoErrors();
        $this->patch("/admin/contributions/{$contribution->id}", [
            'item' => 'Updated contribution', 'type' => 'Text', 'status' => 'Rejected', 'remarks' => 'Needs source details.',
        ])->assertSessionHasNoErrors();

        $this->delete("/admin/learning-materials/{$lesson->id}");
        $this->delete("/admin/cultural-repository/{$repository->id}");
        $this->delete("/admin/feedback/{$feedback->id}");
        $this->delete("/admin/contributions/{$contribution->id}");

        $this->assertDatabaseMissing('learning_modules', ['id' => $lesson->id]);
        $this->assertDatabaseMissing('repository_items', ['id' => $repository->id]);
        $this->assertDatabaseMissing('feedback', ['id' => $feedback->id]);
        $this->assertDatabaseMissing('contributions', ['id' => $contribution->id]);
    }

    public function test_admin_can_save_a_playable_media_source(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Storage::fake('public');

        $this->actingAs($admin)->post('/admin/multimedia', [
            'title' => 'Traditional song',
            'category' => 'Music',
            'media_type' => 'audio',
            'duration' => '03:20',
            'thumbnail' => UploadedFile::fake()->image('song.jpg'),
            'source_file' => UploadedFile::fake()->create('traditional-song.mp3', 100, 'audio/mpeg'),
        ])->assertSessionHasNoErrors();

        $media = MediaItem::where('title', 'Traditional song')->firstOrFail();
        $this->assertStringStartsWith('/storage/media/files/', $media->source_file);
        $this->assertStringStartsWith('/storage/media/thumbnails/', $media->thumbnail);
        Storage::disk('public')->assertExists(substr($media->source_file, strlen('/storage/')));
        Storage::disk('public')->assertExists(substr($media->thumbnail, strlen('/storage/')));
    }

    public function test_admin_can_manage_vocabulary_and_pronunciation_audio(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/vocabulary', [
            'word' => 'Dumay',
            'meaning' => 'Example meaning',
            'pronunciation' => 'du-may',
            'category' => 'Noun',
            'example' => 'A verified usage note.',
            'native_speaker' => 'Elder Rosa',
            'audio_file' => UploadedFile::fake()->create('dumay.mp3', 100, 'audio/mpeg'),
        ])->assertSessionHasNoErrors();

        $word = VocabularyWord::where('word', 'Dumay')->firstOrFail();
        $audio = $word->pronunciationRecord?->audio_file;
        $this->assertStringStartsWith('/storage/pronunciations/', $audio);
        $this->assertSame('Elder Rosa', $word->pronunciationRecord?->native_speaker);
        Storage::disk('public')->assertExists(substr((string) $audio, strlen('/storage/')));

        $this->patch("/admin/vocabulary/{$word->id}", [
            'word' => 'Dumay',
            'meaning' => 'Updated meaning',
            'pronunciation' => 'du-may',
            'category' => 'Expression',
            'native_speaker' => 'Elder Rosa',
        ])->assertSessionHasNoErrors();
        $this->assertSame('Updated meaning', $word->fresh()->meaning);

        $this->delete("/admin/vocabulary/{$word->id}");
        $this->assertDatabaseMissing('vocabulary_words', ['id' => $word->id]);
        Storage::disk('public')->assertMissing(substr((string) $audio, strlen('/storage/')));
    }

    public function test_learner_can_upload_a_profile_photo(): void
    {
        Storage::fake('public');
        $learner = User::factory()->create(['role' => 'learner']);

        $this->actingAs($learner)->patch('/user/settings', [
            'name' => $learner->name,
            'email' => $learner->email,
            'bio' => 'Learner profile',
            'location' => 'Davao',
            'avatar' => UploadedFile::fake()->image('profile.png'),
        ])->assertSessionHasNoErrors();

        $avatar = $learner->fresh()->avatar_path;
        $this->assertStringStartsWith('/storage/avatars/', $avatar);
        Storage::disk('public')->assertExists(substr($avatar, strlen('/storage/')));
    }

    public function test_inactive_accounts_are_logged_out_of_protected_areas(): void
    {
        $learner = User::factory()->create(['role' => 'learner', 'status' => 'Inactive']);

        $this->actingAs($learner)->get('/user')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_inactive_accounts_cannot_use_the_mobile_api(): void
    {
        $learner = User::factory()->create(['role' => 'learner', 'status' => 'Inactive']);
        $token = $learner->createToken('mobile-test')->plainTextToken;

        $this->withToken($token)->getJson('/api/user')
            ->assertForbidden()
            ->assertJsonPath('message', 'Your account is inactive. Please contact an administrator.');

        $this->assertSame(0, $learner->fresh()->tokens()->count());
    }

    public function test_deleting_media_removes_its_uploaded_files(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $thumbnail = '/storage/media/thumbnails/cover.jpg';
        $source = '/storage/media/files/song.mp3';
        Storage::disk('public')->put('media/thumbnails/cover.jpg', 'image');
        Storage::disk('public')->put('media/files/song.mp3', 'audio');
        $media = MediaItem::create(['title' => 'Song', 'media_type' => 'audio', 'thumbnail' => $thumbnail, 'source_file' => $source]);

        $this->actingAs($admin)->delete("/admin/multimedia/{$media->id}");

        Storage::disk('public')->assertMissing('media/thumbnails/cover.jpg');
        Storage::disk('public')->assertMissing('media/files/song.mp3');
    }

    public function test_super_backup_is_encrypted_and_excludes_user_accounts(): void
    {
        Storage::fake('local');
        $super = User::factory()->create(['role' => 'super']);

        $this->actingAs($super)->post('/super/backup')
            ->assertSessionHas('status');

        $files = Storage::disk('local')->files('backups');
        $this->assertCount(1, $files);
        $this->assertStringEndsWith('.json.enc', $files[0]);

        $snapshot = json_decode(Crypt::decryptString(Storage::disk('local')->get($files[0])), true, flags: JSON_THROW_ON_ERROR);
        $this->assertArrayNotHasKey('users', $snapshot['tables']);
        $this->assertArrayHasKey('settings', $snapshot['tables']);
    }
}
