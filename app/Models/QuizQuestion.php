<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    protected $fillable = ['learning_module_id', 'question', 'options', 'answer', 'order'];

    protected $casts = [
        'options' => 'array',
        'answer' => 'integer',
    ];

    public function learningModule(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class);
    }
}
