<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'owner_id',
        'model_id',
        'fuel_type_id',
        'transmission_id',
        'tonality_id',
        'year',
        'km',
        'power_hp',
        'doors'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function model()
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    public function fuelType()
    {
        return $this->belongsTo(FuelType::class);
    }
    public function transmission()
    {
        return $this->belongsTo(Transmission::class);
    }
    public function tonality()
    {
        return $this->belongsTo(Tonality::class);
    }

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
    public function advertisement()
    {
        return $this->hasOne(Advertisement::class, 'vehicle_id');
    }
    
    
}
