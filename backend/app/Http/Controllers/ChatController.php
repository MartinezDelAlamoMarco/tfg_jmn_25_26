<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;       
use App\Models\Message;            
use App\Models\Advertisement;      
use App\Models\ConversationView;   
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Lista todas las conversaciones del usuario actual.
     * Usa la Vista SQL para obtener datos planos y rápidos.
     */
    public function index()
    {
        $userId = Auth::id();

        // Obtenemos los chats usando la vista SQL
        $conversations = ConversationView::where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get();

        // Calculamos los mensajes sin leer para CADA chat
        foreach ($conversations as $chat) {
            $chat->unread_count = Message::where('conversation_id', $chat->id)
                ->where('sender_id', '!=', $userId) // Mensajes que NO enviaste tú
                ->where('is_read', false)
                ->count();
        }

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
        $userId = Auth::id();
        $conversation = ConversationView::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Chat no encontrado'], 404);
        }

        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        // ¡LA MAGIA! Al abrir el chat, marcamos los mensajes del otro como "leídos"
        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Obtenemos los mensajes ordenados por fecha
        $messages = Message::where('conversation_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages
        ]);
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

    public function destroy(int $id)
    {
        // 1. Buscamos el chat usando el modelo original (NO la vista)
        $conversation = Conversation::find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversación no encontrada'], 404);
        }

        // 2. SEGURIDAD: Comprobamos que el usuario que intenta borrarla participe en ella
        $userId = Auth::id();
        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json(['message' => 'No tienes permiso para borrar este chat'], 403);
        }

        // 3. Borramos los mensajes primero (para no dejar basura en la BD)
        Message::where('conversation_id', $conversation->id)->delete();

        // 4. Borramos la conversación
        $conversation->delete();

        return response()->json(['message' => 'Chat y mensajes eliminados correctamente'], 200);
    }

    // --- FUNCIÓN 1: RESERVAR VEHÍCULO ---
    public function reserve(int $id) {
        $userId = Auth::id();
        $conversation = Conversation::findOrFail($id);
        
        if ($conversation->seller_id !== $userId) return response()->json(['error' => 'No autorizado'], 403);

        // 1. Cambiamos el estado del anuncio a reservado
        $ad = Advertisement::find($conversation->advertisement_id);
        $ad->status = 'reservado';
        $ad->save();

        // 2. OPCIONAL: Marcar esta conversación como 'sold' o similar para identificarla
        // Aunque esté reservado, el chat sigue 'active'.

        Message::create([
            'conversation_id' => $id,
            'sender_id' => 2, 
            'content' => "¡Buenas noticias! El vendedor ha reservado el vehículo para ti. Podéis concretar los detalles finales por aquí."
        ]);

        return response()->json(['message' => 'Vehículo reservado']);
    }

    // --- FUNCIÓN 2: CONFIRMAR VENTA Y CERRAR OTROS CHATS ---
    public function confirmSale(int $id) {
        $userId = Auth::id();
        $conversation = Conversation::findOrFail($id);
        if ($conversation->seller_id !== $userId) return response()->json(['error' => 'No autorizado'], 403);

        // 1. Actualizamos el anuncio
        $ad = Advertisement::find($conversation->advertisement_id);
        $ad->status = 'vendido';
        $ad->save();

        // 2. IMPORTANTE: Marcar ESTE chat como 'sold' para diferenciarlo de los 'disabled'
        $conversation->status = 'sold';
        $conversation->save();

        Message::create([
            'conversation_id' => $id,
            'sender_id' => 2,
            'content' => "¡Venta confirmada! El vendedor ha marcado el vehículo como vendido para ti. ¡Disfrútalo!"
        ]);

        // 3. Bloquear el resto de chats
        $others = Conversation::where('advertisement_id', $ad->id)->where('id', '!=', $id)->get();

        foreach ($others as $otherChat) {
            /** @var Conversation $otherChat */
            $otherChat->status = 'disabled';
            $otherChat->save();

            Message::create([
                'conversation_id' => $otherChat->id,
                'sender_id' => 2,
                'content' => "Lo sentimos, este vehículo ha sido vendido a otro usuario. El chat ha sido deshabilitado."
            ]);
        }

        return response()->json(['message' => 'Venta finalizada con éxito']);
    }
}