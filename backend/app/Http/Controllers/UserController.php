<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AdvertisementView;
use App\Models\Review;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(int $id)
    {
        $user = User::findOrFail($id);

        $avg = Review::where('evaluated_id', $id)->avg('rating') ?: 0;
        $count = Review::where('evaluated_id', $id)->count();

        $data = $user->toArray();
        $data['average_rating'] = round($avg, 1);
        $data['reviews_count'] = $count;

        return response()->json($data);
    }

    public function advertisements(int $id)
    {
        $ads = AdvertisementView::where('owner_id', $id)->orderBy('created_at', 'desc')->get();
        return response()->json($ads);
    }
}
