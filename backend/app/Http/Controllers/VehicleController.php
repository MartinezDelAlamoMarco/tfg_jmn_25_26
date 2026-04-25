<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\Advertisement; 
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = VehicleModel::orderBy('name')->with('brand')->get();
        return response()->json($vehicles);
    }

    public function brands() 
    {
        $brands = VehicleBrand::orderBy('name')->get();
        return response()->json($brands);
    }

    public function show($id)
    {
        // Buscamos el anuncio incluyendo las fotos y los datos del vehículo vinculado
        $advertisement = Advertisement::with([
            'vehicle.model.brand', 
            'vehicle.fuelType', 
            'vehicle.transmission', 
            'vehicle.tonality', 
            'images', 
            'province', 
            'state'
        ])->findOrFail($id);

        return response()->json($advertisement);
    }
}