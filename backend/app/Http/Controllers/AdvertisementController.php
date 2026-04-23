<?php

namespace App\Http\Controllers;

use App\Models\AdvertisementView;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        // Consultamos la vista real de Supabase
        $advertisements = AdvertisementView::orderBy('created_at', 'desc')->get();
        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        $advertisements = AdvertisementView::where('brand_id', $brandId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($advertisements);
    }
}