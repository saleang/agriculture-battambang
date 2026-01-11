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
use Illuminate\Support\Facades\Storage;
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
        $provinces = Province::select('province_id', 'name_en', 'name_km')
            ->distinct()
            ->orderBy('name_en')
            ->get();

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

        Log::info('Seller profile update request', [
            'user_id' => $user->user_id,
            'data' => $request->except(['photo', 'certification']),
            'method' => $request->method(),
            'has_photo' => $request->hasFile('photo'),
            'has_certification' => $request->hasFile('certification'),
        ]);

        $validated = $request->validated();

        // Update user fields if present
        $userFields = array_intersect_key($validated, array_flip(['username', 'email', 'phone', 'gender']));

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }
            $path = $request->file('photo')->store('users', 'public');
            $userFields['photo'] = $path;
        }

        if (!empty($userFields)) {
            $user->update($userFields);
        }

        // Ensure seller record exists
        $seller = $user->seller;
        if (!$seller) {
            $seller = $user->seller()->create(['user_id' => $user->user_id]);
        }

        // Handle certification file if uploaded
        if ($request->hasFile('certification')) {
            // Delete old certification if exists
            if ($seller->certification && Storage::disk('public')->exists($seller->certification)) {
                Storage::disk('public')->delete($seller->certification);
            }
            $certPath = $request->file('certification')->store('certifications', 'public');
            $validated['certification'] = $certPath;
        }

        // Remove user keys before filling seller
        foreach (['username', 'email', 'phone', 'gender', 'photo'] as $k) {
            unset($validated[$k]);
        }

        // Prevent overwriting existing certification with a null value
        if (array_key_exists('certification', $validated) && is_null($validated['certification'])) {
            unset($validated['certification']);
        }

        $seller->fill($validated);
        $seller->save();

        Log::info('Seller profile updated successfully', ['user_id' => $user->user_id]);

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Get districts by province ID (for AJAX calls).
     */
    public function getDistricts($provinceId): JsonResponse
    {
        try {
            $districts = District::where('province_id', $provinceId)
                ->select('district_id', 'name_en', 'name_km', 'province_id')
                ->distinct()
                ->orderBy('name_en')
                ->get();

            return response()->json($districts);
        } catch (\Exception $e) {
            Log::error('Error loading districts', [
                'province_id' => $provinceId,
                'error' => $e->getMessage(),
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
    public function getCommunes(int $districtId): JsonResponse
    {
        try {
            $communes = Commune::where('district_id', $districtId)
                ->select('commune_id', 'name_en', 'name_km', 'district_id')
                ->distinct()
                ->orderBy('name_en')
                ->get();

            return response()->json($communes);
        } catch (\Exception $e) {
            Log::error('Error loading communes', [
                'district_id' => $districtId,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to load communes'], 500);
        }
    }

    /**
     * Get villages by commune ID (for AJAX calls).
     */
    public function getVillages(int $communeId): JsonResponse
    {
        try {
            $villages = \App\Models\Village::where('commune_id', $communeId)
                ->select('village_id', 'name_en', 'name_km', 'commune_id')
                ->distinct()
                ->orderBy('name_en')
                ->get();

            return response()->json($villages);
        } catch (\Exception $e) {
            Log::error('Error loading villages', [
                'commune_id' => $communeId,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to load villages'], 500);
        }
    }

    /**
     * Show the farm information edit page.
     */
    public function editFarmInfo(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        $seller = $user->seller;

        if (!$seller) {
            $seller = $user->seller()->create(['user_id' => $user->user_id]);
        }

        $seller->load(['province', 'district', 'commune', 'village']);

        $provinces = Province::select('province_id', 'name_en', 'name_km')
            ->distinct()
            ->orderBy('name_en')
            ->get();

        return Inertia::render('seller/farm_info', [
            'seller' => $seller,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Update farm information.
     */
    public function updateFarmInfo(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        Log::info('Farm info update request', [
            'user_id' => $user->user_id,
            'data' => $request->except(['certification']),
            'method' => $request->method(),
        ]);

        try {
            $validated = $request->validate([
                'farm_name' => ['required', 'string', 'max:255'],
                'province_id' => ['nullable', 'integer', 'exists:provinces,province_id'],
                'district_id' => ['nullable', 'integer', 'exists:districts,district_id'],
                'commune_id' => ['nullable', 'integer', 'exists:communes,commune_id'],
                'village_id' => ['nullable', 'integer', 'exists:villages,village_id'],
                'description' => ['nullable', 'string'],
            ]);

            $seller = $user->seller;
            if (!$seller) {
                $seller = $user->seller()->create(['user_id' => $user->user_id]);
            }

            $seller->fill($validated);
            $seller->save();

            Log::info('Farm info updated successfully', ['user_id' => $user->user_id]);

            return back()->with('success', 'Farm information updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating farm info', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to update farm information. Please try again.']);
        }
    }

    /**
     * Show the payment settings edit page.
     */
    public function editPayment(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        $seller = $user->seller;

        if (!$seller) {
            $seller = $user->seller()->create([
                'user_id' => $user->user_id,
            ]);
        }

        return Inertia::render('seller/payment_info', [
            'seller' => $seller,
        ]);
    }

    /**
     * Update payment settings.
     */
    public function updatePayment(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isSeller()) {
            abort(403, 'You are not authorized to access this page.');
        }

        Log::info('Payment update request', [
            'user_id' => $user->user_id,
            'data' => $request->except(['payment_qr_code']),
            'method' => $request->method(),
            'has_file' => $request->hasFile('payment_qr_code'),
        ]);

        try {
            $validated = $request->validate([
                'bank_account_name' => ['nullable', 'string', 'max:255'],
                'bank_account_number' => ['nullable', 'string', 'max:255'],
                'payment_qr_code' => ['nullable', 'file', 'image', 'max:5120'],
            ]);

            $seller = $user->seller;
            if (!$seller) {
                $seller = $user->seller()->create(['user_id' => $user->user_id]);
            }

            // Handle QR code file upload
            if ($request->hasFile('payment_qr_code')) {
                // Delete old QR code if exists
                if ($seller->payment_qr_code && Storage::disk('public')->exists($seller->payment_qr_code)) {
                    Storage::disk('public')->delete($seller->payment_qr_code);
                }
                $path = $request->file('payment_qr_code')->store('payment_qrcodes', 'public');
                $validated['payment_qr_code'] = $path;
            }

            // Remove null QR code to prevent overwriting existing file
            if (array_key_exists('payment_qr_code', $validated) && is_null($validated['payment_qr_code'])) {
                unset($validated['payment_qr_code']);
            }

            $seller->fill($validated);
            $seller->save();

            Log::info('Payment settings updated successfully', ['user_id' => $user->user_id]);

            return back()->with('success', 'Payment settings updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating payment settings', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to update payment settings. Please try again.']);
        }
    }
}
