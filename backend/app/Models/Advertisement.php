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
        'user_id',      // Asegúrate de que esta columna existe en tu DB
        'vehicle_id',
        'province_id',
        'ad_state_id',
        'price',
        'description',
        'description_en',
        'views',
        'is_rent'
    ];

    /**
     * Relación con el Usuario (Vendedor)
     * Resuelve el error: "Call to undefined relationship [user]"
     */
    // App\Models\Advertisement.php

    public function user(): BelongsTo
    {
        // Si el anuncio NO tiene user_id, lo sacamos del vehículo
        return $this->belongsTo(User::class, 'user_id'); 
    }

    /**
     * Relación con el Vehículo
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Relación con la Provincia
     */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /**
     * Relación con el Estado del Anuncio (Disponible, Vendido, etc.)
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(AdState::class, 'ad_state_id');
    }

    /**
     * Galería de fotos completa
     */
    public function images(): HasMany
    {
        return $this->hasMany(AdvertisementImage::class);
    }

    /**
     * Foto principal para la miniatura
     */
    public function mainImage(): HasOne
    {
        return $this->hasOne(AdvertisementImage::class)->where('is_main', true);
    }

    /**
     * Relación inversa: Un anuncio puede tener muchos alquileres registrados
     */
    public function rents(): HasMany
    {
        return $this->hasMany(Rent::class);
    }
}