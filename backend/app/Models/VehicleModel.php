<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model {
    protected $table = 'vehicle_models';
    protected $primaryKey = 'id';
    public function brand() {
        return $this->belongsTo(VehicleBrand::class, 'brand_id');
    }
    public function vehicles() {
        return $this->hasMany(Vehicle::class);
    }
}
