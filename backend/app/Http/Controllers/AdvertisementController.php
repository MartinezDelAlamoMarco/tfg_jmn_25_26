<?php

namespace App\Http\Controllers;

use App\Models\AdvertisementView; // IMPORTAMOS EL MODELO DE LA VISTA
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        // Consultamos directamente a la vista. ¡Mucho más rápido!
        $advertisements = AdvertisementView::orderBy('created_at', 'desc')->get();

        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        // En la vista, ya tenemos el brand_id en la misma "tabla virtual"
        $advertisements = AdvertisementView::where('brand_id', $brandId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }

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

    public function addFavorite(Request $request, $id)
    {
        $user = $request->user();
        $advertisement = Advertisement::findOrFail($id);
        // Evitar duplicados usando syncWithoutDetaching
        $user->favorites()->syncWithoutDetaching([$advertisement->id]);
        return response()->json(['message' => 'Anuncio añadido a favoritos']);
    }

    public function removeFavorite(Request $request, $id)
    {
        $user = $request->user();
        $advertisement = Advertisement::findOrFail($id);
        $user->favorites()->detach($advertisement->id);
        return response()->json(['message' => 'Anuncio eliminado de favoritos']);
    }
}