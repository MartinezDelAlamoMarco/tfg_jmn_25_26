<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Advertisement;
use App\Models\ConversationView;
use App\Models\Rent;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ChatController extends Controller
{
    // ID del usuario sistema para los mensajes automáticos.
    const SYSTEM_USER_ID = 1;

    //Lista todas las conversaciones del usuario actual
    public function index()
    {
        $userId = Auth::id();

        $conversations = ConversationView::where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($conversations as $chat) {
            $chat->unread_count = Message::where('conversation_id', $chat->id)
                ->where('sender_id', '!=', $userId)
                ->where('is_read', false)
                ->count();
        }

        return response()->json($conversations);
    }

    //Inicia una nueva conversacion/recupera una que ya exista
    public function startConversation(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'seller_id'        => 'required|exists:users,id',
        ]);

        $authUserId = Auth::id();

        if ($authUserId == $request->seller_id) {
            return response()->json(['message' => 'No puedes hablar contigo mismo'], 400);
        }

        $ad = Advertisement::findOrFail($request->advertisement_id);

        // BLOQUEAR PARA ANUNCIOS DE COMPRAVENTA RESERVADOS
        if ($ad->ad_state_id === 2) {
            $existingConv = Conversation::where([
                'advertisement_id' => $request->advertisement_id,
                'buyer_id'         => $authUserId,
            ])->first();

            if (!$existingConv) {
                return response()->json([
                    'message' => 'Este anuncio está reservado y no acepta nuevos contactos.'
                ], 409);
            }

            return response()->json($existingConv);
        }

        //BLOQUEAR PARA ANUNCIOS DE ALQUILER YA RESERVADOS
        if ($ad->is_rented) {
            $activeRent = Rent::where('advertisement_id', $ad->id)
                ->where('end_date', '>=', Carbon::today())
                ->first();

            if ($activeRent) {
                if ($activeRent->renter_id === $authUserId) {
                    $conv = Conversation::firstOrCreate([
                        'advertisement_id' => $ad->id,
                        'buyer_id'         => $authUserId,
                        'seller_id'        => $request->seller_id,
                    ]);
                    return response()->json($conv);
                }
                return response()->json([
                    'message' => 'Este vehículo ya está alquilado. No puedes contactar con el propietario por este anuncio.'
                ], 409);
            }
        }

        $conversation = Conversation::firstOrCreate([
            'advertisement_id' => $request->advertisement_id,
            'buyer_id'         => $authUserId,
            'seller_id'        => $request->seller_id,
        ]);

        return response()->json($conversation);
    }

    //Obtiene los mensajes de un chat concreto
    public function getMessages(int $id)
    {
        $userId = Auth::id();
        $conversation = ConversationView::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Chat no encontrado'], 404);
        }

        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = Message::where('conversation_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'conversation' => $conversation,
            'messages'     => $messages,
        ]);
    }

    //Guarda un nuevo mensaje en la base de datos
    public function sendMessage(Request $request, int $id)
    {
        $request->validate(['content' => 'required|string']);

        // No permitir enviar mensajes en chats deshabilitados
        $conv = Conversation::findOrFail($id);
        if ($conv->status === 'disabled') {
            return response()->json(['message' => 'Este chat está deshabilitado'], 403);
        }

        $message = Message::create([
            'conversation_id' => $id,
            'sender_id'       => Auth::id(),
            'content'         => $request->input('content'),
        ]);

        Conversation::where('id', $id)->update(['updated_at' => now()]);

        return response()->json($message);
    }

    //Elimina una conversación y sus mensajes
    public function destroy(int $id)
    {
        $conversation = Conversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversación no encontrada'], 404);
        }

        $userId = Auth::id();
        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json(['message' => 'No tienes permiso para borrar este chat'], 403);
        }

        Message::where('conversation_id', $conversation->id)->delete();
        $conversation->delete();

        return response()->json(['message' => 'Chat y mensajes eliminados correctamente']);
    }

    //Marca como leídos los mensajes del otro usuario en esta conversacion
    public function markAsRead(int $id)
    {
        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Mensajes marcados como leídos']);
    }


    // LÓGICA DE RESERVA (COMPRAVENTA)
    //El VENDEDOR reserva el anuncio para el comprador de esta conversacio
    public function reserve(int $id)
    {
        $userId = Auth::id();
        $conversation = Conversation::findOrFail($id);

        if ($conversation->seller_id !== $userId) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $ad = Advertisement::with(['vehicle.model.brand'])->findOrFail($conversation->advertisement_id);

        if ($ad->ad_state_id === 2) {
            return response()->json(['error' => 'El anuncio ya está reservado'], 400);
        }

        $reservedUntil  = now()->addDays(14);
        $vehicleName    = $ad->vehicle->model->brand->name . ' ' . $ad->vehicle->model->name;
        $buyerConvView  = ConversationView::find($id);
        $buyerName      = $buyerConvView?->buyer_name ?? 'el comprador';
        $ad->ad_state_id       = 2; // Reservado
        $ad->status            = 'reservado';
        $ad->reserved_buyer_id = $conversation->buyer_id;
        $ad->reserved_until    = $reservedUntil;
        $ad->save();

        // Marcar esta conversación como reservada
        $conversation->status = 'reserved';
        $conversation->save();

        // Mensaje DETALLADO para el comprador que tiene la reserva
        $fechaReserva = now()->setTimezone('Europe/Madrid')->format('d/m/Y \a \l\a\s H:i');
        $fechaExpira  = $reservedUntil->format('d/m/Y');


        // Chicos para poner emojis usar telca windows + . 💩
        Message::create([
            'conversation_id' => $id,
            'sender_id'       => self::SYSTEM_USER_ID,
            'content'         =>
            "¡Reserva confirmada!\n\n" .
                "El vendedor ha reservado este vehículo para ti.\n\n" .
                "🚗 Vehículo: {$vehicleName}\n" .
                "👤 Reservado para: {$buyerName}\n" .
                "📅 Fecha de reserva: {$fechaReserva}\n" .
                "⏳ Caduca el: {$fechaExpira}\n\n" .
                "Cuando hayáis completado la transacción, el vendedor pulsará «Confirmar venta final» en este menú para cerrar el trato.",
        ]);

        // Avisar a los OTROS compradores con chat abierto
        $otherConversations = Conversation::where('advertisement_id', $ad->id)
            ->where('id', '!=', $id)
            ->where('status', 'active')
            ->get();

        foreach ($otherConversations as $other) {
            Message::create([
                'conversation_id' => $other->id,
                'sender_id'       => self::SYSTEM_USER_ID,
                'content'         =>
                "Anuncio reservado.\n\n" .
                    "Este vehículo ha sido reservado para otro usuario. " .
                    "Si la compra no se completa antes del {$fechaExpira}, volverá a estar disponible.",
            ]);
        }

        return response()->json(['message' => 'Vehículo reservado correctamente']);
    }

    //el vendedor cancela la reserva y el anuncio vuelve a Disponible
    public function cancelReserve(int $id)
    {
        $userId = Auth::id();
        $conversation = Conversation::findOrFail($id);

        if ($conversation->seller_id !== $userId) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $ad = Advertisement::findOrFail($conversation->advertisement_id);

        if ($ad->ad_state_id !== 2) {
            return response()->json(['error' => 'El anuncio no está reservado'], 400);
        }

        // Limpiar reserva
        $ad->ad_state_id       = 1; // Disponible
        $ad->status            = 'disponible';
        $ad->reserved_buyer_id = null;
        $ad->reserved_until    = null;
        $ad->save();

        $conversation->status = 'active';
        $conversation->save();

        Message::create([
            'conversation_id' => $id,
            'sender_id'       => self::SYSTEM_USER_ID,
            'content'         =>
            "Reserva cancelada.\n\n" .
                "El vendedor ha cancelado la reserva. El vehículo vuelve a estar disponible para todos.",
        ]);

        // Notificar también a los otros compradores
        $others = Conversation::where('advertisement_id', $ad->id)
            ->where('id', '!=', $id)
            ->get();

        foreach ($others as $other) {
            Message::create([
                'conversation_id' => $other->id,
                'sender_id'       => self::SYSTEM_USER_ID,
                'content'         => "La reserva anterior ha sido cancelada. ¡El vehículo ya está disponible de nuevo!",
            ]);
        }

        return response()->json(['message' => 'Reserva cancelada']);
    }

    //El VENDEDOR amplia el tiempo de reserva
    public function extendReserve(Request $request, int $id)
    {
        $request->validate([
            'reserved_until' => 'required|date|after:now',
        ]);

        $userId = Auth::id();
        $conversation = Conversation::findOrFail($id);

        if ($conversation->seller_id !== $userId) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $ad = Advertisement::findOrFail($conversation->advertisement_id);

        if ($ad->ad_state_id !== 2) {
            return response()->json(['error' => 'El anuncio no está reservado'], 400);
        }

        // Actualizamos la fecha
        $newDate = Carbon::parse($request->reserved_until);
        $ad->reserved_until = $newDate;
        $ad->save();

        // Avisamos en el chat de la ampliación
        $fechaExpira = $newDate->format('d/m/Y \a \l\a\s H:i');

        Message::create([
            'conversation_id' => $id,
            'sender_id'       => self::SYSTEM_USER_ID,
            'content'         => "⏳ ¡Tiempo de reserva ampliado!\n\nEl vendedor ha extendido la reserva de este vehículo.\n\nNueva fecha límite: {$fechaExpira}.",
        ]);

        return response()->json(['message' => 'Reserva ampliada correctamente']);
    }

    //El VENDEDOR confirma la venta desde el chat (flujo alternativo)
    public function confirmSale(int $id)
    {
        $userId = Auth::id();
        $conversation = Conversation::findOrFail($id);

        if ($conversation->seller_id !== $userId) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $ad = Advertisement::findOrFail($conversation->advertisement_id);

        $ad->ad_state_id       = 3; // Vendido
        $ad->status            = 'vendido';
        $ad->reserved_buyer_id = $conversation->buyer_id;
        $ad->reserved_until    = null;
        $ad->save();

        $conversation->status = 'sold';
        $conversation->save();

        Message::create([
            'conversation_id' => $id,
            'sender_id'       => self::SYSTEM_USER_ID,
            'content'         => "¡Venta confirmada! El vendedor ha cerrado la operación. ¡Que lo disfrutes!",
        ]);

        Conversation::where('advertisement_id', $ad->id)
            ->where('id', '!=', $id)
            ->update(['status' => 'disabled']);

        $others = Conversation::where('advertisement_id', $ad->id)
            ->where('id', '!=', $id)
            ->get();

        foreach ($others as $other) {
            Message::create([
                'conversation_id' => $other->id,
                'sender_id'       => self::SYSTEM_USER_ID,
                'content'         => "Lo sentimos, este vehículo ha sido vendido a otro usuario. El chat ha sido deshabilitado.",
            ]);
        }

        return response()->json(['message' => 'Venta confirmada']);
    }
}
