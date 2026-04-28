<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAdController extends Controller
{
    public function index(Request $request)
{
    $search = $request->query('search');

    $ads = DB::table('view_advertisements_details')
        ->when($search, function($query, $search) {
            $query->where('brand_name', 'like', "%{$search}%")
                  ->orWhere('model_name', 'like', "%{$search}%")
                  ->orWhere('id', '=', is_numeric($search) ? $search : null);
        })
        ->orderBy('created_at', 'desc')
        ->paginate(10);

    // Transformamos los resultados para convertir el string de imágenes en un objeto
    $ads->getCollection()->transform(function ($ad) {
        $ad->images = json_decode($ad->images);
        return $ad;
    });

    return response()->json($ads);
}

    public function updateState(Request $request, int $id)
    {
        $request->validate(['ad_state_id' => 'required|exists:ad_states,id']);

        DB::table('advertisements')
            ->where('id', $id)
            ->update(['ad_state_id' => $request->ad_state_id]);

        return response()->json(['message' => 'Estado del anuncio actualizado']);
    }
}