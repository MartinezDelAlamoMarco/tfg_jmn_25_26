<?php

namespace App\Http\Controllers;

// Importamos el modelo real y no la vista
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        // Traemos el anuncio con todas sus relaciones, incluyendo las imágenes
        $advertisements = Advertisement::with(['vehicle.model.brand', 'images', 'province', 'ad_state'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        $advertisements = Advertisement::with(['vehicle.model.brand', 'images', 'province', 'ad_state'])
            ->whereHas('vehicle.model', function($query) use ($brandId) {
                $query->where('brand_id', $brandId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }
}