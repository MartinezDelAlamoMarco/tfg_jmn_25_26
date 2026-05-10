<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Lista todas las valoraciones recibidas por un usuario específico.
     * Útil para el componente UserReviews en el perfil.
     */
    public function index(int $userId)
    {
    $reviews = Review::with('reviewer:id,name') 
        ->where('evaluated_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json($reviews);
}

    /**
     * Guarda una nueva valoración.
     * Llamado desde el ChatInterface cuando la venta se confirma.
     */
    public function store(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'rating'           => 'required|integer|min:1|max:5',
            'comment'          => 'nullable|string|max:500',
        ]);

        $userId = Auth::id();

        // SEGURIDAD: Solo el comprador de una conversación 'sold' puede valorar
        $conv = Conversation::where('advertisement_id', $request->advertisement_id)
            ->where('buyer_id', $userId)
            ->where('status', 'sold')
            ->first();

        if (!$conv) {
            return response()->json([
                'message' => 'No tienes permiso para valorar esta venta o aún no se ha completado.'
            ], 403);
        }

        try {
            $review = Review::create([
                'advertisement_id' => $request->advertisement_id,
                'reviewer_id'      => $userId,
                'evaluated_id'     => $conv->seller_id,
                'rating'           => $request->rating,
                'comment'          => $request->comment,
            ]);

            return response()->json([
                'message' => '¡Valoración enviada con éxito!',
                'review' => $review
            ]);

        } catch (\Exception $e) {
            // Captura el error si el UNIQUE INDEX de la DB detecta duplicidad
            return response()->json([
                'message' => 'Ya has valorado esta transacción anteriormente.'
            ], 400);
        }
    }

    /**
     * Comprueba si el usuario actual puede dejar una reseña a otro usuario.
     * Útil para lógica de UI en el frontend.
     */
    public function canReview(int $evaluatedId)
    {
        $userId = Auth::id();

        // Existe alguna venta finalizada entre ellos donde el logueado sea el comprador?
        $can = Conversation::where('seller_id', $evaluatedId)
            ->where('buyer_id', $userId)
            ->where('status', 'sold')
            ->exists();

        return response()->json(['can_review' => $can]);
    }
}