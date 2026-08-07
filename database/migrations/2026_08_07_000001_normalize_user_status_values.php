<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->whereRaw('LOWER(status) = ?', ['active'])->update(['status' => User::STATUS_ACTIVE]);
        DB::table('users')->whereRaw('LOWER(status) = ?', ['inactive'])->update(['status' => User::STATUS_INACTIVE]);
        DB::table('users')->whereNull('status')->update(['status' => User::STATUS_ACTIVE]);
    }

    public function down(): void
    {
        // Status normalization is intentionally irreversible.
    }
};
