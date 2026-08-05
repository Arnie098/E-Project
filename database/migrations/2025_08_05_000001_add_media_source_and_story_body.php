<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * media_items previously stored only a thumbnail, so the mobile app had no
     * way to play the actual recording. stories stored only a short summary,
     * so there was nothing to show on a story detail view.
     */
    public function up(): void
    {
        Schema::table('media_items', function (Blueprint $table) {
            $table->string('source_file')->nullable();
        });

        Schema::table('stories', function (Blueprint $table) {
            $table->longText('body')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('media_items', function (Blueprint $table) {
            $table->dropColumn('source_file');
        });

        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn('body');
        });
    }
};
