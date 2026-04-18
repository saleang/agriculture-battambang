<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Seller;
use Inertia\Inertia;

class AdminRatingController extends Controller
{
    public function index()
    {
        $ratings = Rating::with([
                'user:user_id,username,photo',
                'seller:seller_id,farm_name',
            ])
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
                    'farm' => [
                        'id'   => $rating->seller->seller_id,
                        'name' => $rating->seller->farm_name,
                    ],
                ];
            });

        // Per-farm summary
        $farmSummaries = $ratings
            ->groupBy('farm.id')
            ->map(function ($group) {
                $farm = $group->first()['farm'];
                return [
                    'farm_id'        => $farm['id'],
                    'farm_name'      => $farm['name'],
                    'total_ratings'  => $group->count(),
                    'average_rating' => round($group->avg('rating'), 1),
                ];
            })
            ->values();

        return Inertia::render('admin/ratings', [
            'ratings'       => $ratings,
            'farmSummaries' => $farmSummaries,
            'totalRatings'  => $ratings->count(),
            'averageRating' => round($ratings->avg('rating'), 1),
        ]);
    }

    public function destroy(Rating $rating)
    {
        $rating->delete();
        return redirect()->back()->with('success', 'Rating deleted successfully.');
    }
}