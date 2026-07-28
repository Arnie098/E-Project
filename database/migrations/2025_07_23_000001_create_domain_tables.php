<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_modules', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('learning_module_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamps();
        });

        Schema::create('repository_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->nullable();
            $table->string('type')->nullable();
            $table->text('description')->nullable();
            $table->string('media')->nullable();
            $table->timestamps();
        });

        Schema::create('vocabulary_words', function (Blueprint $table) {
            $table->id();
            $table->string('word');
            $table->string('meaning');
            $table->text('example')->nullable();
            $table->timestamps();
        });

        Schema::create('media_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->nullable();
            $table->string('media_type'); // image | video | audio
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->string('duration')->nullable();
            $table->string('thumbnail')->nullable();
            $table->timestamps();
        });

        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('story_type'); // Legend | Origin Story | Folktale | Myth
            $table->string('author')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->string('read_time')->nullable();
            $table->text('summary')->nullable();
            $table->json('categories')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('contributor_name')->nullable();
            $table->string('item');
            $table->string('type'); // Story | Audio | Image | Text
            $table->string('status')->default('Pending'); // Pending | Approved | Rejected
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->timestamp('starts_at');
            $table->string('location')->nullable();
            $table->timestamps();
        });

        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject');
            $table->text('body');
            $table->string('status')->default('Open');
            $table->timestamps();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('author')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('icon')->nullable(); // lucide icon key
            $table->timestamps();
        });

        Schema::create('achievement_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('earned_at')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor')->nullable();
            $table->string('action');
            $table->string('icon')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('achievement_user');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('events');
        Schema::dropIfExists('contributions');
        Schema::dropIfExists('stories');
        Schema::dropIfExists('media_items');
        Schema::dropIfExists('vocabulary_words');
        Schema::dropIfExists('repository_items');
        Schema::dropIfExists('learning_module_user');
        Schema::dropIfExists('learning_modules');
    }
};
