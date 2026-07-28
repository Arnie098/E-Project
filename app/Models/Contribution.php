<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contribution extends Model
{
    protected $fillable = ['user_id', 'contributor_name', 'item', 'description', 'type', 'status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ResourceVerification::class);
    }
}
