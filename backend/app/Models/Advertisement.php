<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;
    protected $table = 'advertisements';


    protected $primaryKey = 'advertisement_id';

    public $incrementing = true;

    protected $guarded = [];


    /*** Un anuncio puede tener muchos favoritos.*/
    public function favourites()
    {
        return $this->hasMany(Favourite::class, 'advertisement_id');
    }

    /* Un anuncio puede estar en muchas transacciones.*/
    public function transactions()
    {
        return $this->hasMany(Transactions::class, 'advertisement_id');
    }

    /*** Un anuncio tiene muchas imágenes.*/
    public function advertisementImages()
    {
        return $this->hasMany(AdvertisementImage::class, 'advertisement_id');
    }

    /*** Un anuncio pertenece a un usuario (vendedor).*/
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** * Un anuncio puede estar asociado a un alquiler (si aplica).*/
    public function rent()
    {
        return $this->belongsTo(Rent::class, 'rent_id');
    }

    /*** Un anuncio pertenece a un modelo de vehículo específico. */
    public function model()
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }
}