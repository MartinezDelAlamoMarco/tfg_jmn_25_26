<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        // Datos de ejemplo
        /*
        $vehiculos = [
            ['id' => 1, 'marca' => 'Toyota', 'modelo' => 'Corolla', 'precio' => 15000],
            ['id' => 2, 'marca' => 'Honda', 'modelo' => 'Civic', 'precio' => 17000],
        ];
        */
        $vehiculos = Vehicle::all();

        return response()->json($vehiculos);
    }

    public function find(string $id) {
        $vehiculo = Vehicle::find($id);
        return response()->json($vehiculo);
    }
}
