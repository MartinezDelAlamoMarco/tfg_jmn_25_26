<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(int $userId)
    {
        $reviews = Review::with('reviewer:id,name')
            ->where('evaluated_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }
    public function store(Request $request)
    {
        $request->validate([
            'advertisement_id' => 'required|exists:advertisements,id',
            'rating'           => 'required|integer|min:1|max:5',
            'comment'          => 'nullable|string|max:500',
        ]);

        $userId = Auth::id();

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
            return response()->json([
                'message' => 'Ya has valorado esta transacción anteriormente.'
            ], 400);
        }
    }

    public function canReview(int $evaluatedId)
    {
        $userId = Auth::id();
        
        $can = Conversation::where('seller_id', $evaluatedId)
            ->where('buyer_id', $userId)
            ->where('status', 'sold')
            ->exists();

        return response()->json(['can_review' => $can]);
    }
}
