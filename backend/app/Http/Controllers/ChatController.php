<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function startConversation(Request $request) 
    {
        try {
            $request->validate([
                'advertisement_id' => 'required|exists:advertisements,id',
                'seller_id' => 'required|exists:users,id',
            ]);

            $authUserId = Auth::id(); // Usamos Auth::id() por seguridad

            if ($authUserId == $request->seller_id) {
                return response()->json(['message' => 'No puedes hablar contigo mismo'], 400);
            }

            // Buscamos si ya existe una conversación entre estos dos para este anuncio
            $conversation = Conversation::where('advertisement_id', $request->advertisement_id)
                ->where('buyer_id', $authUserId)
                ->where('seller_id', $request->seller_id)
                ->first();

            // Si no existe, la creamos
            if (!$conversation) {
                $conversation = Conversation::create([
                    'advertisement_id' => $request->advertisement_id,
                    'buyer_id' => $authUserId,
                    'seller_id' => $request->seller_id
                ]);
            }

            return response()->json($conversation);

        } catch (\Exception $e) {
            // Esto devolverá el mensaje de error exacto (ej. "Field 'status' doesn't have a default value")
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Obtener los mensajes de una conversación
    public function getMessages($id)
    {
        $conversation = Conversation::with(['messages', 'advertisement.vehicle.model.brand', 'buyer', 'seller'])
            ->findOrFail($id);

        // Seguridad: Solo el comprador o el vendedor pueden ver los mensajes
        if (Auth::id() !== $conversation->buyer_id && Auth::id() !== $conversation->seller_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($conversation);
    }

    // Enviar un mensaje
    public function sendMessage(Request $request, $id)
    {
        $request->validate(['content' => 'required|string']);

        $message = Message::create([
            'conversation_id' => $id,
            'sender_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return response()->json($message);
    }

    // Obtener todas las conversaciones del usuario autenticado
    public function index()
    {
        $userId = Auth::id();

        $conversations = Conversation::with(['advertisement.vehicle.brand', 'advertisement.vehicle.vehicle_model', 'buyer', 'seller'])
            ->where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($conversations);
    }
}