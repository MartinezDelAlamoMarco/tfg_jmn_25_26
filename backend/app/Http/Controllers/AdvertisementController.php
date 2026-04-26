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
}