<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\Advertisement; 
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
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
        try {
            // Buscamos el anuncio incluyendo todas las relaciones
            $advertisement = Advertisement::with([
                'vehicle.model.brand', 
                'vehicle.fuelType', 
                'vehicle.transmission', 
                'vehicle.tonality', 
                'images', 
                'province', 
                'state' // Relación definida en Advertisement.php
            ])->findOrFail($id);

            // Intentamos incrementar las visitas de forma segura
            try {
                $throttleKey = 'view_ad_' . $id . '_' . $request->ip();
                
                // Si el RateLimiter falla, no detiene la ejecución del resto
                RateLimiter::attempt($throttleKey, 1, function() use ($advertisement) {
                    $advertisement->increment('views');
                }, 300);
            } catch (\Exception $e) {
                // Logueamos el error de visitas pero permitimos que el anuncio cargue
                Log::warning("Error en contador de visitas: " . $e->getMessage());
            }

            return response()->json($advertisement);

        } catch (\Exception $e) {
            // Si el error es la carga del anuncio, devolvemos el error real para debuggear
            return response()->json([
                'error' => 'Error interno en el servidor',
                'message' => $e->getMessage(), // Esto te dirá qué columna o relación falla
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}