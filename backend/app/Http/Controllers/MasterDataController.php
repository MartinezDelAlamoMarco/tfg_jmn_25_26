<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\Province;
use App\Models\FuelType;
use App\Models\Tonality;
use App\Models\Transmission;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    public function getBrands() {
        return response()->json(VehicleBrand::orderBy('name')->get());
    }

    public function getModelsByBrand($brandId) {
        return response()->json(VehicleModel::where('brand_id', $brandId)->orderBy('name')->get());
    }

    public function getProvinces() { return response()->json(Province::orderBy('name')->get()); }
    public function getFuelTypes() { return response()->json(FuelType::all()); }
    public function getTonalities() { return response()->json(Tonality::all()); }
    public function getTransmissions() { return response()->json(Transmission::all()); }
}