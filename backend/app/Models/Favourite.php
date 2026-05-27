<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favourite extends Model
{
    use HasFactory;

    protected $table = 'favourites';

    protected $fillable = [
        'user_id', 
        'advertisement_id', 
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function advertisement(): BelongsTo
    {
        return $this->belongsTo(Advertisement::class, 'advertisement_id'); 
    }
}