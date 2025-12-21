<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\SellerProfileUpdateRequest;
use App\Models\Commune;
use App\Models\District;
use App\Models\Province;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SellerProfileController extends Controller
{
    /**
     * Show the seller's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        $seller = $user->seller;

        // If seller profile does not exist yet, create an empty one
        // so the edit page can be used to populate it.
        if (!$seller) {
            $seller = $user->seller()->create([
                'user_id' => $user->user_id,
                'farm_name' => '',
                'province_id' => null,
                'district_id' => null,
                'commune_id' => null,
                'village_id' => null,
            ]);
        }

        // Load all provinces for the dropdown
        $provinces = Province::orderBy('name_en')->get();

        return Inertia::render('seller/profile', [
            'seller' => $seller,
            'provinces' => $provinces,
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

        return to_route('seller.profile.edit')->with('success', 'Profile updated successfully!');
    }

    /**
     * Get districts by province ID (for AJAX calls).
     */
    public function getDistricts($provinceId): JsonResponse
    {
        try {
            Log::info('Loading districts for province: ' . $provinceId);

            $province = Province::findOrFail($provinceId);
            $districts = $province->districts()
                ->orderBy('name_en')
                ->get(['district_id', 'name_en', 'name_km', 'province_id']);

            Log::info('Districts loaded', ['count' => $districts->count()]);

            return response()->json($districts);
        } catch (\Exception $e) {
            Log::error('Error loading districts', [
                'province_id' => $provinceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to load districts',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get communes by district ID (for AJAX calls).
     */
    public function getCommunes(int $districtId)
    {
        $communes = District::findOrFail($districtId)
            ->communes()
            ->orderBy('name_en')
            ->get();

        return response()->json($communes);
    }

    /**
     * Get villages by commune ID (for AJAX calls).
     */
    public function getVillages(int $communeId)
    {
        $villages = Commune::findOrFail($communeId)
            ->villages()
            ->orderBy('name_en')
            ->get();

        return response()->json($villages);
    }
}
