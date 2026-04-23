<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\AdvertisementView; // Importamos la Vista
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = VehicleModel::orderBy('name')->with('brand')->get();
        return response()->json($vehicles);
    }

    public function find($id)
    {
        $vehicle = VehicleModel::with('brand')->find($id);
        if (!$vehicle) {
            return response()->json(['message' => 'Vehículo no encontrado'], 404);
        }
        return response()->json($vehicle);
    }

    public function brands() 
    {
        $brands = VehicleBrand::orderBy('name')->get();
        return response()->json($brands);
    }

    public function vehicleByBrand($brand_id) 
    {
        $vehicles = VehicleModel::where('brand_id', '=', $brand_id)->with('brand')->get();
        return response()->json($vehicles);
    }

    public function show($id)
    {
        // Aquí cambiamos para que los detalles carguen desde la Vista
        $advertisement = AdvertisementView::findOrFail($id);

        return response()->json($advertisement);
    }
}