<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use App\Models\Advertisement;

class VehicleController extends Controller
{
    public function index()
    {
        // Datos de ejemplo
        $vehicles = VehicleModel::orderBy('name')->with('brand')->get();
        return response()->json($vehicles);
    }

    public function find($id)
    {
        $vehicle = VehicleModel::with('brand')->find($id);

        if (!$vehicle) {
            return response()->json([
                'message' => 'Vehículo no encontrado'
            ], 404);
        }

        return response()->json($vehicle);
    }

    public function brands() {
        $brands = VehicleBrand::orderBy('name')->get();
        return response()->json($brands);
    }

    public function vehicleByBrand($brand_id) {
        $vehicles = VehicleModel::where('brand_id', '=', $brand_id)->with('brand')->get();
        return response()->json($vehicles);
    }

    public function show($id)
    {
        $vehicle = Advertisement::with(['model', 'advertisementImages'])
                    ->findOrFail($id);

        return response()->json($vehicle);
    }
}
