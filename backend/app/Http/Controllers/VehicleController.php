<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\Advertisement; 
use Illuminate\Support\Facades\Cache;
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

    public function show(Request $request, $id)
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

        // Creamos una clave única en caché usando la IP del cliente y la ID del anuncio
        $cacheKey = 'viewed_ad_' . $id . '_' . $request->ip();

        // Cache::add es una operación ATÓMICA. Devuelve true solo si la clave NO existía y la acaba de crear.
        // Esto frena en seco las peticiones simultáneas del StrictMode de React.
        if (Cache::add($cacheKey, true, now()->addMinutes(5))) {
            $advertisement->increment('views');
            $advertisement->refresh();
        }

        return response()->json($advertisement);
    }
}