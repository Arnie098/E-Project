<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeEmbedding extends Model
{
    protected $fillable = ['source', 'source_id', 'content_hash', 'vector'];

    protected $casts = [
        'vector' => 'array',
    ];
}
