<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleBrand extends Model {
    public function models() {
        return $this->hasMany(VehicleModel::class, 'brand_id');
    }
}
