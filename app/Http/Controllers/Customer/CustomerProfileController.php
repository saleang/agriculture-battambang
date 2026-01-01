<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerProfileUpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class CustomerProfileController extends Controller
{
    /**
     * Show the customer's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isCustomer()) {
            abort(403, 'You are not authorized to access this page.');
        }

        // return Inertia::render('customer/profile', [
        //     'user' => $user->user_id,
        //     'username' => $user->username,
        //     'email' => $user->email,
        //     'phone' => $user->phone,
        //     'gender' => $user->gender,
        //     'address' => $user->address,
        //     'photo' => $user->photo,
        //     'photo_url' => $user->getPhotoUrlAttribute(),

        // ]);
        // Auth user is automatically shared by HandleInertiaRequests middleware
        // No need to pass user data explicitly
        return Inertia::render('customer/profile');
    }

    /**
     * Update the customer's profile.
     */
    public function update(CustomerProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isCustomer()) {
            abort(403, 'You are not authorized to access this page.');
        }

        try {
            $validated = $request->validated();

            // Handle photo upload
            if ($request->hasFile('photo')) {
                Log::info('Processing photo upload', [
                    'user_id' => $user->user_id,
                    'photo_size' => $request->file('photo')->getSize(),
                    'photo_mime' => $request->file('photo')->getMimeType(),
                ]);

                // Delete old photo if exists
                if ($user->photo) {
                    if (Storage::disk('public')->exists($user->photo)) {
                        Storage::disk('public')->delete($user->photo);
                        Log::info('Deleted old photo', ['path' => $user->photo]);
                    }
                }

                // Store new photo
                $path = $request->file('photo')->store('users', 'public');
                $validated['photo'] = $path;

                Log::info('Photo uploaded successfully', [
                    'user_id' => $user->user_id,
                    'path' => $path
                ]);
            } else {
                // Don't overwrite photo if not uploading new one
                unset($validated['photo']);
            }

            // Update user
            $user->update($validated);

            Log::info('Customer profile updated successfully', [
                'user_id' => $user->user_id,
                'updated_fields' => array_keys($validated),
            ]);

            return back()->with('success', 'Profile updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Customer profile validation failed', [
                'user_id' => $user->user_id,
                'errors' => $e->errors(),
            ]);

            // Re-throw validation exception so Inertia can handle it
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error updating customer profile', [
                'user_id' => $user->user_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to update profile. Please try again.']);
        }
    }
}
