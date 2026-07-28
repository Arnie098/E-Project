<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceVerification extends Model
{
    protected $fillable = ['contribution_id', 'verified_by', 'status', 'remarks', 'verified_at'];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
