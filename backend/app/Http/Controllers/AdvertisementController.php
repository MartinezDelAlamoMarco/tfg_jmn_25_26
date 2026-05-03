<?php

namespace App\Http\Controllers;

use App\Models\AdvertisementView;
use App\Models\Advertisement;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- VITAL para que Auth::user() funcione

class AdvertisementController extends Controller
{
    protected GoogleDriveService $googleDriveService;

    /**
     * Constructor para inyectar el servicio de Google Drive
     */
    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    /**
     * Listado general de anuncios (Venta y Alquiler)
     */
    public function index()
    {
        $advertisements = AdvertisementView::orderBy('created_at', 'desc')->get();
        return response()->json($advertisements);
    }

    /**
     * Filtro por marca
     */
    public function byBrand(int $brandId)
    {
        $advertisements = AdvertisementView::where('brand_id', $brandId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }

    /**
     * Listar favoritos del usuario
     */
    public function favorites(Request $request)
    {
        $user = $request->user();
        $favorites = $user->favorites()->with([
            'vehicle.model.brand', 
            'images', 
            'province', 
            'state'
        ])->get();

        return response()->json($favorites);
    }

    /**
     * Añadir a favoritos
     */
    public function addFavorite(Request $request, int $id)
    {
        $user = $request->user();
        $advertisement = Advertisement::findOrFail($id);
        $user->favorites()->syncWithoutDetaching([$advertisement->id]);
        return response()->json(['message' => 'Anuncio añadido a favoritos']);
    }

    /**
     * Quitar de favoritos
     */
    public function removeFavorite(Request $request, int $id)
    {
        $user = $request->user();
        $advertisement = Advertisement::findOrFail($id);
        $user->favorites()->detach($advertisement->id);
        return response()->json(['message' => 'Anuncio eliminado de favoritos']);
    }

    /**
     * ELIMINACIÓN DE ANUNCIO (Moderación)
     */
    public function destroy(int $id)
    {
        // 1. Verificamos si el usuario está logueado y es admin
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado. Se requiere perfil de administrador.'], 403);
        }

        // 2. Buscamos el anuncio con sus imágenes asociadas
        $advertisement = Advertisement::with('images')->findOrFail($id);

        try {
            // 3. Recorremos las imágenes para borrarlas de Google Drive
            foreach ($advertisement->images as $image) {
                $urlParts = parse_url($image->image_url);
                parse_str($urlParts['query'] ?? '', $queryParams);
                $fileId = $queryParams['id'] ?? null;

                if ($fileId) {
                    $this->googleDriveService->deleteFile($fileId);
                }
            }

            // 4. Borramos el registro de la base de datos
            // (El cascade borrará automáticamente registros en advertisement_images y reports)
            $advertisement->delete();

            return response()->json(['message' => 'Anuncio y recursos multimedia eliminados con éxito']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error durante la eliminación: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $advertisement = Advertisement::with([
                'vehicle.model.brand', // Ruta correcta según tu Vehicle.php
                'vehicle.fuelType',
                'vehicle.transmission',
                'images',
                'user',
                'province'
            ])->findOrFail($id);

            return response()->json($advertisement);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}