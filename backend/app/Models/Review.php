<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'advertisement_id',
        'reviewer_id',
        'evaluated_id',
        'rating',
        'comment',
    ];

    public function advertisement(): BelongsTo
    {
        return $this->belongsTo(Advertisement::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }


    public function evaluated(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_id');
    }
}