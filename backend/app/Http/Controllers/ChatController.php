<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationView;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Lista todas las conversaciones del usuario actual.
     * Usa la Vista SQL para obtener datos planos y rápidos.
     */
    public function index()
    {
        $userId = Auth::id();

        $conversations = ConversationView::where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($conversations);
    }

    /**
     * Inicia una nueva conversación o recupera una existente.
     */
    public function startConversation(Request $request) 
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'seller_id' => 'required|exists:users,id',
        ]);

        $authUserId = Auth::id();

        if ($authUserId == $request->seller_id) {
            return response()->json(['message' => 'No puedes hablar contigo mismo'], 400);
        }

        $conversation = Conversation::firstOrCreate([
            'advertisement_id' => $request->advertisement_id,
            'buyer_id' => $authUserId,
            'seller_id' => $request->seller_id
        ]);

        return response()->json($conversation);
    }

    /**
     * Obtiene los mensajes de un chat específico.
     * Carga la información del vehículo y participantes desde la Vista.
     */
    public function getMessages(int $id)
    {
        $conversation = ConversationView::with('messages')->findOrFail($id);

        // Seguridad: Verificar que el usuario pertenece a la charla
        if (Auth::id() !== $conversation->buyer_id && Auth::id() !== $conversation->seller_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($conversation);
    }

    /**
     * Guarda un nuevo mensaje en la base de datos.
     */
    public function sendMessage(Request $request, int $id)
    {
        $request->validate(['content' => 'required|string']);

        $message = Message::create([
            'conversation_id' => $id,
            'sender_id' => Auth::id(),
            // Evitamos conflicto con la propiedad protegida de la clase Request
            'content' => $request->input('content'),
        ]);

        // Actualizamos el timestamp de la conversación para que suba en la lista
        Conversation::where('id', $id)->update(['updated_at' => now()]);

        return response()->json($message);
    }
}