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
}