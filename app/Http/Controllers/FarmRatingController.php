<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FarmRatingController extends Controller
{
    public function store(Request $request, $farmId)
    {
        $request->validate([
            'rating' => ['required', 'integer', 'min:1,max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $seller = Seller::findOrFail($farmId);

        Rating::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'seller_id' => $seller->seller_id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return redirect()->back()->with('success', 'ការវាយតម្លៃរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ!');
    }
}