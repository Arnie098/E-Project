<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['actor', 'action', 'icon', 'occurred_at'];

    protected $casts = ['occurred_at' => 'datetime'];

    /**
     * Record a system activity for the audit trail (Activity Logs, Table 35).
     */
    public static function record(string $actor, string $action, ?string $icon = null): void
    {
        static::create([
            'actor' => $actor,
            'action' => $action,
            'icon' => $icon,
            'occurred_at' => now(),
        ]);
    }
}
