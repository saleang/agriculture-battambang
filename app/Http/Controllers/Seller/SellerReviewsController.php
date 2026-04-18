<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SellerReviewsController extends Controller
{
    public function index()
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            abort(403, 'Seller profile not found.');
        }

        $ratings = Rating::where('seller_id', $seller->seller_id)
            ->with(['user:user_id,username,photo'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($rating) {
                return [
                    'id'         => $rating->rating_id,
                    'rating'     => $rating->rating,
                    'comment'    => $rating->comment,
                    'created_at' => $rating->created_at,
                    'user' => [
                        'id'     => $rating->user->user_id,
                        'name'   => $rating->user->name ?? $rating->user->username,
                        'avatar' => $rating->user->photo,
                    ],
                ];
            });

        $averageRating = $ratings->avg('rating');
        $ratingCounts  = $ratings->groupBy('rating')->map->count();

        return Inertia::render('seller/reviews', [
            'ratings'       => $ratings,
            'averageRating' => round($averageRating, 1),
            'totalRatings'  => $ratings->count(),
            'ratingCounts'  => $ratingCounts,
            'farmName'      => $seller->farm_name,
        ]);
    }
}