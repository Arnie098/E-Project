<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatAttachment extends Model
{
    protected $fillable = [
        'user_id',
        'chat_log_id',
        'disk',
        'path',
        'original_name',
        'mime',
        'kind',
        'size',
        'extracted_text',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function chatLog(): BelongsTo
    {
        return $this->belongsTo(ChatLog::class);
    }

    public function isImage(): bool
    {
        return $this->kind === 'image';
    }
}
