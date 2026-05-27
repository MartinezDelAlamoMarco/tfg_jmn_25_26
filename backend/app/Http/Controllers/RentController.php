<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rent;
use App\Models\Advertisement;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RentController extends Controller
{
    const SYSTEM_USER_ID = 1;

    public function store(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'start_date'       => 'required|date|after_or_equal:today',
            'end_date'         => 'required|date|after:start_date',
        ]);

        $authUserId = Auth::id();
        $ad = Advertisement::with(['vehicle.model.brand'])->findOrFail($request->advertisement_id);

        $activeRent = Rent::where('advertisement_id', $ad->id)
            ->where('end_date', '>=', Carbon::today())
            ->first();

        if ($activeRent) {
            if ($activeRent->renter_id !== $authUserId) {
                return response()->json([
                    'message' => 'Este vehículo ya está alquilado durante ese periodo y no está disponible.'
                ], 409);
            }
        }

        // Calcular dias
        $start = Carbon::parse($request->start_date);
        $end   = Carbon::parse($request->end_date);
        $days  = max(1, $start->diffInDays($end));

        $totalPrice = $ad->price * $days;

        $rent = Rent::create([
            'advertisement_id' => $request->advertisement_id,
            'renter_id'        => $authUserId,
            'start_date'       => $request->start_date,
            'end_date'         => $request->end_date,
            'total_price'      => $totalPrice,
        ]);

        $ownerId = $ad->vehicle->owner_id ?? null;

        if ($ownerId && $ownerId !== $authUserId) {
            $renterConv = Conversation::firstOrCreate([
                'advertisement_id' => $ad->id,
                'buyer_id'         => $authUserId,
                'seller_id'        => $ownerId,
            ]);

            $vehicleName  = $ad->vehicle->model->brand->name . ' ' . $ad->vehicle->model->name;
            $fechaInicio  = $start->format('d/m/Y');
            $fechaFin     = $end->format('d/m/Y');

            Message::create([
                'conversation_id' => $renterConv->id,
                'sender_id'       => self::SYSTEM_USER_ID,
                'content'         =>
                "¡Reserva de alquiler confirmada!\n\n" .
                    "🚗 Vehículo: {$vehicleName}\n" . //Chicos para poner iconos tecla windows + . 👍
                    "📅 Recogida: {$fechaInicio}\n" .
                    "📅 Devolución: {$fechaFin}\n" .
                    "💶 Total: " . number_format($totalPrice, 2, ',', '.') . " €\n\n" .
                    "Contacta con el propietario para concretar el lugar y hora de entrega.",
            ]);

            Conversation::where('advertisement_id', $ad->id)
                ->where('id', '!=', $renterConv->id)
                ->update(['status' => 'disabled']);

            // Obtenemos las conversaciones para enviar los mensajes de notificación
            $otherConvs = Conversation::where('advertisement_id', $ad->id)
                ->where('id', '!=', $renterConv->id)
                ->get();

            foreach ($otherConvs as $other) {
                Message::create([
                    'conversation_id' => $other->id,
                    'sender_id'       => self::SYSTEM_USER_ID,
                    'content'         =>
                    "Anuncio no disponible.\n\n" .
                        "Este vehículo ya ha sido reservado por otro usuario. " .
                        "El chat ha sido deshabilitado.",
                ]);
            }
        }

        return response()->json([
            'message' => 'Reserva confirmada con éxito',
            'rent'    => $rent,
        ], 201);
    }

    public function myRents()
    {
        $rents = Rent::with(['advertisement.vehicle.model.brand', 'advertisement.images'])
            ->where('renter_id', Auth::id())
            ->get();

        return response()->json($rents);
    }

    //Devuelve los rangos de fechas ya reservados para un anuncio
    public function getBookedDates(int $advertisement_id)
    {
        $booked = Rent::where('advertisement_id', $advertisement_id)
            ->where('end_date', '>=', now()->format('Y-m-d'))
            ->select('start_date', 'end_date')
            ->get();

        return response()->json($booked);
    }

    // Obtener las reservas activas de un cliente específico para un anuncio
    public function getChatRents(int $adId, int $renterId)
    {
        $rents = Rent::where('advertisement_id', $adId)
            ->where('renter_id', $renterId)
            ->where('end_date', '>=', now()->format('Y-m-d'))
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json($rents);
    }

    //Cancelar una reserva especifica
    public function destroy(int $id)
    {
        $rent = Rent::findOrFail($id);
        $rent->delete();

        return response()->json(['message' => 'Reserva cancelada correctamente']);
    }
}
