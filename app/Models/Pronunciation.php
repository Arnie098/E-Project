<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pronunciation extends Model
{
    protected $fillable = ['vocabulary_word_id', 'audio_file', 'native_speaker', 'verified_by', 'verified_at'];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function word(): BelongsTo
    {
        return $this->belongsTo(VocabularyWord::class, 'vocabulary_word_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
