<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'province_id',
        'ad_state_id',
        'price',
        'description',
        'views',
        'is_rent'
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
    public function province()
    {
        return $this->belongsTo(Province::class);
    }
    public function state()
    {
        return $this->belongsTo(AdState::class, 'ad_state_id');
    }

    // Galería de fotos
    public function images()
    {
        return $this->hasMany(AdvertisementImage::class);
    }

    // Foto principal para la miniatura
    public function mainImage()
    {
        return $this->hasOne(AdvertisementImage::class)->where('is_main', true);
    }

    // Relación inversa: Un anuncio puede tener muchos alquileres
    public function rents()
    {
        return $this->hasMany(Rent::class);
    }
}
