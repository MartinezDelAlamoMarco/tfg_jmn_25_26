<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        // Traemos el vehículo, la marca, el estado, la provincia y las fotos
        $advertisements = Advertisement::with([
            'vehicle.model.brand', 
            'state', 
            'province', 
            'images'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        // El filtro ahora busca DENTRO de la tabla vehicles -> models
        $advertisements = Advertisement::with([
            'vehicle.model.brand', 
            'state', 
            'province', 
            'images'
        ])
        ->whereHas('vehicle.model', function ($query) use ($brandId) {
            $query->where('brand_id', $brandId);
        })
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($advertisements);
    }
}