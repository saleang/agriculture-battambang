<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Seller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 

class FarmController extends Controller
{
    public function index()
    {
        $sellers = Seller::with('user', 'province', 'district', 'commune', 'village')
            ->withCount('followers')
            ->latest()
            ->get();

        // Get the IDs of the farms the current user is following
        $followedSellersIds = [];
        if (Auth::check()) {
            $user = User::find(Auth::id());
            if ($user) {
                $followedSellersIds = $user->following()->pluck('sellers.seller_id')->toArray();
            }
        }

        return Inertia::render('Farmers', [
            'sellers' => $sellers->map(function ($seller) use ($followedSellersIds) {
                return [
                    'seller_id' => $seller->seller_id,
                    'farm_name' => $seller->farm_name,
                    'description' => $seller->description,
                    'full_location' => $seller->full_location,
                    'rating_average' => $seller->rating_average,
                    'rating_count' => $seller->rating_count,
                    'followers_count' => $seller->followers_count,
                    'is_followed' => in_array($seller->seller_id, $followedSellersIds), // Check if the seller is followed
                    'user' => [
                        'photo' => $seller->user->photo,
                    ],
                ];
            }),
        ]);
    }
    public function show(Request $request, $id)
{
    $farm = Seller::with([
        'user',
        'products.images',
        'province', 'district', 'commune', 'village',
        'ratings.user'
    ])->findOrFail($id);

    $followersCount = $farm->followers()->count();

    $isFollowing = false;
    $user = $request->user();
    $wishlistedProductIds = [];
    $canReview = false;

    if ($user) {
        $isFollowing = $user->following()
            ->where('sellers.seller_id', $id)
            ->exists();

        // Get the product IDs for the current farm
        $productIds = $farm->products->pluck('product_id');

        // Find which of those products are in the user's wishlist
        // The fix is here: use `user_id` which is the correct primary key for the User model.
        $wishlistedProductIds = DB::table('wishlists')
            ->where('user_id', $user->user_id)
            ->whereIn('product_id', $productIds)
            ->pluck('product_id')
            ->toArray();

        $canReview = Order::where('user_id', $user->user_id)
            ->whereHas('items.product.seller', function ($query) use ($id) {
                $query->where('seller_id', $id);
            })
            ->where('status', 'completed')
            ->exists();
    }

    return Inertia::render('FarmDetail', [
        'farm' => [
            'id'            => $farm->seller_id,
            'farm_name'     => $farm->farm_name,
            'description'   => $farm->description,
            'full_location' => $farm->full_location,
            'user' => [
                'photo' => $farm->user->photo ?? null,
                'email' => $farm->user->email ?? null,
                'phone' => $farm->user->phone ?? null,
            ],
            'products' => $farm->products->map(function ($product) {
                return [
                    'product_id'   => $product->product_id,
                    'productname'  => $product->productname,
                    'price'        => $product->price,
                    'unit'         => $product->unit,
                    'images'       => $product->images->map(fn($image) => [
                        'image_url' => $image->image_url,
                    ]),
                ];
            })->toArray(),  // ← toArray() is safer for Inertia

            // Optional: add social links if you have them in the model
            // 'facebook'  => $farm->facebook ?? null,
            // 'telegram'  => $farm->telegram ?? null,
            // 'whatsapp'  => $farm->whatsapp ?? null,
            'phone'     => $farm->phone ?? null,
        ],

        'ratings' => $farm->ratings->map(function ($rating) {
            return [
                'id'         => $rating->id,
                'user'       => [
                    'id'     => $rating->user->id,
                    'name'   => $rating->user->name ?? $rating->user->username,
                    'avatar' => $rating->user->avatar ?? $rating->user->photo ?? null,
                ],
                'rating'     => $rating->rating,
                'comment'    => $rating->comment,
                'created_at' => $rating->created_at->toIso8601String(),
            ];
        })->toArray(),

        'isFollowing'    => $isFollowing,
        'followersCount' => $followersCount,
        'wishlistedProductIds' => $wishlistedProductIds,
        'canReview' => $canReview,
    ]);
}

    public function toggleFollow(Request $request, Seller $farm)
    {
        $user = User::find(Auth::id());

        if (!$user) {
            // This case is for API-like usage, which we are doing with axios
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Toggle the follow relationship
        $user->following()->toggle($farm);

        // After toggling, get the fresh state
        $isFollowing = $user->following()->where('sellers.seller_id', $farm->seller_id)->exists();
        $followersCount = $farm->followers()->count();

        // Return the authoritative state as JSON
        return response()->json([
            'isFollowing' => $isFollowing,
            'followersCount' => $followersCount
        ]);
    }
}