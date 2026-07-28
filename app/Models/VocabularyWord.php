<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VocabularyWord extends Model
{
    protected $fillable = ['word', 'meaning', 'pronunciation', 'category', 'example'];

    public function pronunciationRecord(): HasOne
    {
        return $this->hasOne(Pronunciation::class);
    }
}
