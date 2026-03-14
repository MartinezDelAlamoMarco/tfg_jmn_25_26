<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Http\Request;

class MyAdvertisements extends Controller
{
    public function index($userId)
    {
        //Comprobar que el usuario existe
        $user = User::findOrFail($userId);
        if (! $user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        //Buscamos los anuncios del usuario (traemos sus relaciones [imágnes y modelo del coche])
        $advertisements = Advertisement::where('user_id', $userId)->OrderBy('created_at', 'desc')->get();

        //Devolvemos los anuncios
        return response()->json([
            'user_name' => $user->name, 
            'total_advertisements' => $advertisements->count(), 
            'advertisements' => $advertisements
        ], 200);
    }
}
