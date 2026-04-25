<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\Advertisement; // Cambiamos a Advertisement
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    // ... otros métodos (index, find, etc) se mantienen igual ...

    public function show($id)
    {
        // Cargamos el anuncio por ID incluyendo sus imágenes y datos técnicos
        $advertisement = Advertisement::with([
            'vehicle.model.brand', 
            'vehicle.fuelType', 
            'vehicle.transmission', 
            'vehicle.tonality', 
            'images', 
            'province', 
            'ad_state'
        ])->findOrFail($id);

        return response()->json($advertisement);
    }
}