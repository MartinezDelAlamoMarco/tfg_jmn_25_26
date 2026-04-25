<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Advertisement;
use App\Models\VehicleBrand;          // Añadido para buscar la marca
use App\Models\AdvertisementImage;    // Añadido para guardar la imagen
use App\Services\GoogleDriveService;  // Añadido para conectar con Drive

class MyAdvertisements extends Controller
{
    public function index()
    {
        $userId = Auth::id();

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
        // 1. Validamos los datos
        $request->validate([
            'price' => 'required|numeric',
            'vehicle_model_id' => 'required',
            'vehicle_brand_id' => 'required', // Viene del frontend, lo necesitamos para la carpeta
            'province_id' => 'required',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120', // Reglas para cada foto individual
        ]);

        try {
            // Iniciamos la transacción manualmente para mayor control
            DB::beginTransaction();

            // 2. Crear el Vehículo (Tabla: vehicles)
            $vehicle = Vehicle::create([
                'owner_id'         => Auth::id(),
                'model_id'         => $request->vehicle_model_id,
                'fuel_type_id'     => $request->fuel_type_id,
                'transmission_id'  => $request->transmission_id,
                'tonality_id'      => $request->tonality_id,
                'year'             => $request->year,
                'km'               => $request->mileage, 
                'power_hp'         => $request->hp,      
                'doors'            => $request->doors,
            ]);

            // 3. Crear el Anuncio (Tabla: advertisements)
            $advertisement = Advertisement::create([
                'vehicle_id'   => $vehicle->id,
                'province_id'  => $request->province_id,
                'ad_state_id'  => 1,
                'price'        => $request->price,
                'description'  => $request->description,
                'views'        => 0,
            ]);

            // 4. Lógica de subida a Google Drive
            if ($request->hasFile('images')) {
    $brand = VehicleBrand::find($request->vehicle_brand_id);
    $brandName = $brand ? $brand->name : 'Sin_Marca';
    $driveService = new GoogleDriveService();

    // Recorremos cada imagen que nos manda React
    foreach ($request->file('images') as $index => $file) {
        // Añadimos uniqid() para que si subes 3 fotos con el mismo nombre no se pisen en Drive
        $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();

        $uploadData = $driveService->uploadImageByBrand(
            $file->getRealPath(),
            $fileName,
            $brandName
        );

        // Guardamos en BD. ¡Truco!: La primera imagen del array ($index == 0) será la principal
        AdvertisementImage::create([
            'advertisement_id' => $advertisement->id,
            'image_url'        => $uploadData['url'],
            'is_main'          => $index === 0 ? true : false
        ]);
    }
}

            // Confirmamos los cambios en la Base de Datos
            DB::commit();

            return response()->json(['message' => '¡Vehículo publicado con éxito!'], 201);
            
        } catch (\Exception $e) {
            // Si algo falla (BD o Drive), deshacemos la inserción en BD
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $ad = Advertisement::with(['vehicle.model'])->findOrFail($id);

        if ($ad->vehicle->owner_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json($ad);
    }

    public function update(Request $request, $id)
    {
        $ad = Advertisement::with('vehicle')->findOrFail($id);

        if ($ad->vehicle->owner_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        try {
            DB::transaction(function () use ($request, $ad) {
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