<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaItem extends Model
{
    protected $fillable = ['title', 'category', 'media_type', 'published_at', 'views', 'duration', 'thumbnail', 'source_file'];

    protected $casts = ['published_at' => 'datetime'];
}
