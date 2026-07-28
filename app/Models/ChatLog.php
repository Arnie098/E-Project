<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatLog extends Model
{
    protected $fillable = ['user_id', 'user_message', 'bot_response'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
