<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['title', 'starts_at', 'location'];

    protected $casts = ['starts_at' => 'datetime'];
}
