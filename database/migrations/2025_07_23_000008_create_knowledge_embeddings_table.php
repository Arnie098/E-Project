<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_embeddings', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->unsignedBigInteger('source_id');
            $table->string('content_hash');
            $table->longText('vector');
            $table->timestamps();

            $table->unique(['source', 'source_id']);
            $table->index('content_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_embeddings');
    }
};
