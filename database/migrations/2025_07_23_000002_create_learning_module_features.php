<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Enrich learning modules to match the capstone Learning Materials schema
        // (Module + Difficulty) and give each lesson readable content.
        Schema::table('learning_modules', function (Blueprint $table) {
            $table->string('module')->nullable()->after('category');      // Language | Culture
            $table->string('difficulty')->nullable()->after('module');    // Beginner | Intermediate | Advanced
            $table->longText('content')->nullable()->after('difficulty');
        });

        // Learning Progress: derive status from progress; record completion date.
        Schema::table('learning_module_user', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('progress');
        });

        // Quiz questions belonging to a lesson.
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_module_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->json('options');                       // array of choice strings
            $table->unsignedTinyInteger('answer');         // index of the correct option
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        // Quiz Results (capstone Table 24): score + pass/fail remark per attempt.
        Schema::create('quiz_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('learning_module_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');          // number correct
            $table->unsignedTinyInteger('total');          // number of questions
            $table->string('remarks');                     // Passed | Failed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_results');
        Schema::dropIfExists('quiz_questions');

        Schema::table('learning_module_user', function (Blueprint $table) {
            $table->dropColumn('completed_at');
        });

        Schema::table('learning_modules', function (Blueprint $table) {
            $table->dropColumn(['module', 'difficulty', 'content']);
        });
    }
};
