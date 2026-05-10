<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'province_id',
        'ad_state_id',
        'price',
        'description',
        'description_en',
        'views',
        'is_rent',
        'status' // <-- AÑADIDO: Para permitir Disponible, Reservado y Vendido
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id'); 
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(AdState::class, 'ad_state_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(AdvertisementImage::class);
    }

    public function mainImage(): HasOne
    {
        return $this->hasOne(AdvertisementImage::class)->where('is_main', true);
    }

    public function rents(): HasMany
    {
        return $this->hasMany(Rent::class);
    }
}