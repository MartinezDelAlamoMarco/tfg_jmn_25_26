<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleBrand extends Model {
    protected $table = 'vehicle_brands';
    protected $primaryKey = 'id';
    public function models() {
        return $this->hasMany(VehicleModel::class, 'brand_id');
    }
}
