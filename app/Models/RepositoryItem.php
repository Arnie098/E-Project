<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepositoryItem extends Model
{
    protected $fillable = ['title', 'category', 'type', 'description', 'media'];
}
