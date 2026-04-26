<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        // Traemos el anuncio con su vehículo, marca, modelo e IMÁGENES
        $advertisements = Advertisement::with([
            'vehicle.model.brand', 
            'images', 
            'province', 
            'state'
        ])->orderBy('created_at', 'desc')->get();

        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        $advertisements = Advertisement::with([
            'vehicle.model.brand', 
            'images', 
            'province', 
            'state'
        ])
        ->whereHas('vehicle.model', function($query) use ($brandId) {
            $query->where('brand_id', $brandId);
        })
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