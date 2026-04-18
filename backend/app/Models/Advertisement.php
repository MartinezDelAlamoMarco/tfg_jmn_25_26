<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model {
    protected $fillable = ['vehicle_id', 'province_id', 'ad_state_id', 'price', 'description', 'views'];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function province() { return $this->belongsTo(Province::class); }
    public function state() { return $this->belongsTo(AdState::class, 'ad_state_id'); }

    // Galería de fotos
    public function images() {
        return $this->hasMany(AdvertisementImage::class);
    }

    // Foto principal para la miniatura
    public function mainImage() {
        return $this->hasOne(AdvertisementImage::class)->where('is_main', true);
    }
}