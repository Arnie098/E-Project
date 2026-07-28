<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Community Contributions gain a description (Table 31).
        Schema::table('contributions', function (Blueprint $table) {
            $table->text('description')->nullable()->after('item');
        });

        // Feedback gains a numeric rating (Table 34).
        Schema::table('feedback', function (Blueprint $table) {
            $table->unsignedTinyInteger('rating')->nullable()->after('body');
        });

        // Resource Verification (Table 32): records an admin/elder's review of a
        // community contribution before it is published.
        Schema::create('resource_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contribution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status');                 // Approved | Rejected
            $table->text('remarks')->nullable();
            $table->timestamp('verified_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_verifications');

        Schema::table('feedback', function (Blueprint $table) {
            $table->dropColumn('rating');
        });

        Schema::table('contributions', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
