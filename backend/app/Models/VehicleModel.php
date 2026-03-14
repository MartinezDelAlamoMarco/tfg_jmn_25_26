<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $table = 'vehicle_models';

    // Oculta brand_id del JSON
    protected $hidden = ['brand_id'];

    public function brand(){
        return $this->belongsTo(VehicleBrand::class);
    }
    public function advertisements(){
        return $this->hasMany(Advertisement::class);
    }
}
