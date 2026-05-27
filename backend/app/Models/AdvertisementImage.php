<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvertisementImage extends Model 
{
    protected $fillable = [
        'advertisement_id', 
        'image_url', 
        'is_main'
    ];
    public function advertisement() 
    { 
        return $this->belongsTo(Advertisement::class); 
    }
}