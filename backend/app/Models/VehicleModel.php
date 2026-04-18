<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model {
    public function brand() {
        return $this->belongsTo(VehicleBrand::class, 'brand_id');
    }
    public function vehicles() {
        return $this->hasMany(Vehicle::class);
    }
}
