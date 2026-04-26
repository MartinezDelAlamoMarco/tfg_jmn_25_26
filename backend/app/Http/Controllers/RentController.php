<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rent;
use App\Models\Advertisement;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
        ]);

        $ad = Advertisement::findOrFail($request->advertisement_id);
        
        // Calcular diferencia de días
        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);
        $days = $start->diffInDays($end);
        
        if ($days <= 0) $days = 1; // Mínimo un día

        $totalPrice = $ad->price * $days;

        $rent = Rent::create([
            'advertisement_id' => $request->advertisement_id,
            'renter_id' => Auth::id(),
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_price' => $totalPrice
        ]);

        return response()->json([
            'message' => 'Reserva confirmada con éxito',
            'rent' => $rent
        ], 201);
    }

    public function myRents()
    {
        $rents = Rent::with(['advertisement.vehicle.model.brand', 'advertisement.images'])
            ->where('renter_id', Auth::id())
            ->get();
            
        return response()->json($rents);
    }
}