<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        $advertisements = Advertisement::with('model.brand')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }

    public function byBrand($brandId)
    {
        $advertisements = Advertisement::with('model.brand')
            ->whereHas('model', function ($query) use ($brandId) {
                $query->where('brand_id', $brandId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($advertisements);
    }
}
