<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningModule extends Model
{
    protected $fillable = ['title', 'description', 'category', 'module', 'difficulty', 'content', 'image'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('progress', 'completed_at')->withTimestamps();
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function quizResults(): HasMany
    {
        return $this->hasMany(QuizResult::class);
    }
}
