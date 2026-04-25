<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvertisementImage extends Model 
{
    // 1. Indicamos qué campos se pueden guardar masivamente desde el controlador
    protected $fillable = [
        'advertisement_id', 
        'image_url', 
        'is_main'
    ];

    // Relación Inversa: Una imagen pertenece a un anuncio
    public function advertisement() 
    { 
        return $this->belongsTo(Advertisement::class); 
    }
}