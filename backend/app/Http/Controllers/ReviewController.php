<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // List reviews for a given evaluated user (public)
    public function index(int $id)
    {
        $reviews = Review::where('evaluated_id', $id)
            ->with('reviewer:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'stars' => $r->rating,
                    'comment' => $r->comment,
                    'author' => $r->reviewer ? ['id' => $r->reviewer->id, 'name' => $r->reviewer->name] : null,
                    'created_at' => $r->created_at,
                ];
            });

        return response()->json($reviews);
    }

    // Check if currently authenticated user can review target user (must have a transaction together)
    public function canReview(Request $request, int $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['can_review' => false]);
        if ($user->id == $id) return response()->json(['can_review' => false]);

        $exists = Transaction::where(function ($q) use ($user, $id) {
            $q->where('buyer_id', $user->id)->where('seller_id', $id);
        })->orWhere(function ($q) use ($user, $id) {
            $q->where('buyer_id', $id)->where('seller_id', $user->id);
        })->exists();

        return response()->json(['can_review' => (bool) $exists]);
    }

    // Store a new review (authenticated)
    public function store(Request $request, int $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        if ($user->id == $id) return response()->json(['message' => 'No puedes valorarte a ti mismo.'], 400);

        $data = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:2000',
        ]);

        // Only allow if there is at least one transaction between users
        $allowed = Transaction::where(function ($q) use ($user, $id) {
            $q->where('buyer_id', $user->id)->where('seller_id', $id);
        })->orWhere(function ($q) use ($user, $id) {
            $q->where('buyer_id', $id)->where('seller_id', $user->id);
        })->exists();

        if (!$allowed) {
            return response()->json(['message' => 'No puedes valorar a este usuario.'], 403);
        }

        $review = Review::create([
            'reviewer_id' => $user->id,
            'evaluated_id' => $id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        $review->load('reviewer:id,name');

        return response()->json([
            'id' => $review->id,
            'stars' => $review->rating,
            'comment' => $review->comment,
            'author' => $review->reviewer ? ['id' => $review->reviewer->id, 'name' => $review->reviewer->name] : null,
            'created_at' => $review->created_at,
        ], 201);
    }
}
