<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Align Vocabulary Dictionary with the capstone schema (Table 25):
        // add the phonetic pronunciation guide and the word category.
        Schema::table('vocabulary_words', function (Blueprint $table) {
            $table->string('pronunciation')->nullable()->after('meaning'); // e.g. "sa-la-mat"
            $table->string('category')->nullable()->after('pronunciation'); // Greeting | Noun | ...
        });

        // Pronunciation Library (Table 26): verified audio recordings per word.
        Schema::create('pronunciations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocabulary_word_id')->constrained()->cascadeOnDelete();
            $table->string('audio_file')->nullable();          // path/URL to the recording
            $table->string('native_speaker');                  // who recorded it
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pronunciations');

        Schema::table('vocabulary_words', function (Blueprint $table) {
            $table->dropColumn(['pronunciation', 'category']);
        });
    }
};
