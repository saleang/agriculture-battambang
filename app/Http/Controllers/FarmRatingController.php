<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;

class FarmRatingController extends Controller
{
    public function store(Request $request, $farm)
{
    $request->validate([
        'rating' => ['required', 'integer', 'min:1', 'max:5'],
        'comment' => ['nullable', 'string', 'max:2000'],
    ]);

    $farmId = (int) trim($farm);
    $seller = Seller::findOrFail($farmId);

    // Get all product IDs for the seller.
    $productIds = $seller->products()->pluck('product_id');

    // Check if an order exists matching the criteria.
    $hasPurchased = Order::where('user_id', Auth::id())
        // ->where('status', 'completed') // We can uncomment this after fixing the issue
        ->whereHas('items', function ($query) use ($productIds) {
            $query->whereIn('product_id', $productIds);
        })
        ->exists();

    if (!$hasPurchased) {
        return redirect()->back()->withErrors(['error' => 'You can only review farms you have purchased from.']);
    }

    Rating::updateOrCreate(
        [
            'user_id' => Auth::id(),
            'seller_id' => $farmId,
        ],
        [
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]
    );

    return redirect()->back()->with('success', 'ការវាយតម្លៃរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ!');
}
}