<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvertisementView extends Model
{
    // Apuntamos a la vista de Supabase
    protected $table = 'view_advertisements_details';
    
    // Las vistas no se pueden insertar/modificar, así que desactivamos esto
    public $incrementing = false;
    public $timestamps = false;

    // Convertimos el texto JSON de las fotos a un array de PHP automáticamente
    protected $casts = [
        'images' => 'array'
    ];
}