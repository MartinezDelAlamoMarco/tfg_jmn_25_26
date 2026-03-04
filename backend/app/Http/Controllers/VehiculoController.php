<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    public function index()
    {
        // Datos de ejemplo
        $vehiculos = [
            ['id' => 1, 'marca' => 'Toyota', 'modelo' => 'Corolla', 'precio' => 15000],
            ['id' => 2, 'marca' => 'Honda', 'modelo' => 'Civic', 'precio' => 17000],
        ];

        return response()->json($vehiculos);
    }
}
