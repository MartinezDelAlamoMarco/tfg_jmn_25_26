<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Http\Request;

class MyAdvertisements extends Controller
{
    public function index($userId)
    {
        // Comprobar que el usuario existe
        $user = User::findOrFail($userId);

        // Buscamos los anuncios CUYO vehículo pertenezca a este usuario
        $advertisements = Advertisement::whereHas('vehicle', function($query) use ($userId) {
            $query->where('owner_id', $userId);
        })
        ->with(['vehicle.model.brand', 'state', 'images'])
        ->orderBy('created_at', 'desc')
        ->get();

        // Devolvemos los anuncios
        return response()->json([
            'user_name' => $user->name, 
            'total_advertisements' => $advertisements->count(), 
            'advertisements' => $advertisements
        ], 200);
    }
}