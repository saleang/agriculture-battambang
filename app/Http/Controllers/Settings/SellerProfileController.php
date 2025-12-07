<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SellerProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SellerProfileController extends Controller
{
    /**
     * Show the seller's profile settings page.
     */
    public function editseller(Request $request): Response
    {
        $user = $request->user();
        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        return Inertia::render('settings/seller-profile', [
            'seller' => $user->seller,
        ]);
    }

    /**
     * Update the seller's profile settings.
     */
    public function update(SellerProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        // Debug logging
        Log::info('Seller profile update request', [
            'user_id' => $user->user_id,
            'data' => $request->validated(),
            'method' => $request->method(),
        ]);

        $seller = $user->seller;
        $seller->fill($request->validated());
        $seller->save();

        Log::info('Seller profile updated successfully', ['user_id' => $user->user_id]);

        return to_route('seller.profile.edit');
    }
}
