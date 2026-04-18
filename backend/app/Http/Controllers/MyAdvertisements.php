<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Advertisement;

class MyAdvertisements extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // ESTO ES PARA DIAGNÓSTICO: Si userId es null, devolverá un error 403
        if (!$userId) {
            return response()->json(['error' => 'No detecto tu usuario', 'auth_check' => Auth::check()], 403);
        }

        $myAds = Advertisement::with(['vehicle.model.brand', 'images', 'province', 'state'])
            ->whereHas('vehicle', function ($query) use ($userId) {
                $query->where('owner_id', $userId);
            })
            ->get();

        return response()->json($myAds);
    }

    public function destroy($id)
    {
        $userId = Auth::id();

        // Buscamos el anuncio pero asegurándonos de que el vehículo sea del usuario
        $ad = Advertisement::where('id', $id)
            ->whereHas('vehicle', function ($query) use ($userId) {
                $query->where('owner_id', $userId);
            })->first();

        if (!$ad) {
            return response()->json(['message' => 'Anuncio no encontrado o no tienes permiso'], 404);
        }

        $ad->delete();

        return response()->json(['message' => 'Anuncio eliminado correctamente'], 200);
    }
    public function store(Request $request)
    {
        // 1. Validamos solo lo que realmente existe en la BD
        $request->validate([
            'price' => 'required|numeric',
            'vehicle_model_id' => 'required',
            'province_id' => 'required',
        ]);

        try {
            return DB::transaction(function () use ($request) {

                // 2. Crear el Vehículo (Tabla: vehicles)
                // Usamos los nombres exactos de tu CREATE TABLE
                $vehicle = Vehicle::create([
                    'owner_id'         => Auth::id(),
                    'model_id'         => $request->vehicle_model_id,
                    'fuel_type_id'     => $request->fuel_type_id,
                    'transmission_id'  => $request->transmission_id,
                    'tonality_id'      => $request->tonality_id,
                    'year'             => $request->year,
                    'km'               => $request->mileage, // Mapeamos mileage de React a km de SQL
                    'power_hp'         => $request->hp,      // Mapeamos hp de React a power_hp de SQL
                    'doors'            => $request->doors,
                ]);

                // 3. Crear el Anuncio (Tabla: advertisements)
                // IMPORTANTE: No enviamos 'title' porque tu tabla no lo tiene
                $advertisement = Advertisement::create([
                    'vehicle_id'   => $vehicle->id,
                    'province_id'  => $request->province_id,
                    'ad_state_id'  => 1,
                    'price'        => $request->price,
                    'description'  => $request->description,
                    'views'        => 0,
                ]);

                return response()->json(['message' => '¡Vehículo publicado con éxito!'], 201);
            });
        } catch (\Exception $e) {
            // Esto te enviará el mensaje de error real a la consola de React
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Para cargar los datos en el formulario de edición
    public function show($id)
{
    // Usamos load() o with() para traer el vehículo y su modelo
    $ad = Advertisement::with(['vehicle.model'])->findOrFail($id);

    if ($ad->vehicle->owner_id !== Auth::id()) {
        return response()->json(['error' => 'No autorizado'], 403);
    }

    return response()->json($ad);
}

    // Para guardar los cambios
    public function update(Request $request, $id)
    {
        $ad = Advertisement::with('vehicle')->findOrFail($id);

        if ($ad->vehicle->owner_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        try {
            DB::transaction(function () use ($request, $ad) {
                // Actualizar vehículo
                $ad->vehicle->update([
                    'model_id'         => $request->vehicle_model_id,
                    'fuel_type_id'     => $request->fuel_type_id,
                    'transmission_id'  => $request->transmission_id,
                    'tonality_id'      => $request->tonality_id,
                    'year'             => $request->year,
                    'km'               => $request->mileage,
                    'power_hp'         => $request->hp,
                    'doors'            => $request->doors,
                ]);

                // Actualizar anuncio
                $ad->update([
                    'province_id' => $request->province_id,
                    'price'       => $request->price,
                    'description' => $request->description,
                ]);
            });

            return response()->json(['message' => 'Anuncio actualizado con éxito']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
