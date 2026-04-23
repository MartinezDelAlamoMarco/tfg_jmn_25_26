<?php

namespace App\Http\Controllers;

use App\Models\AdvertisementView; // Usamos la Vista
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        // Consulta plana a la vista: rapidísimo
        $advertisements = AdvertisementView::orderBy('created_at', 'desc')->get();

        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        // Filtramos directamente por la columna brand_id de la vista
        $advertisements = AdvertisementView::where('brand_id', $brandId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }
}