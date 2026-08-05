<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    protected $fillable = ['title', 'story_type', 'author', 'published_at', 'views', 'read_time', 'summary', 'body', 'categories', 'image'];

    protected $casts = [
        'published_at' => 'datetime',
        'categories' => 'array',
    ];
}
