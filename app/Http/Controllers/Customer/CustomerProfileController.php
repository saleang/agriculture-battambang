<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerProfileUpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
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
            $user->fill($request->validated());

            if ($request->hasFile('photo')) {
                Log::info('[DEBUG] Has photo file.');

                // Delete old photo if it exists
                if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                    Storage::disk('public')->delete($user->photo);
                    Log::info('[DEBUG] Deleted old photo: ' . $user->photo);
                }

                // Store new photo and update the user's photo attribute
                $path = $request->file('photo')->store('users', 'public');
                Log::info('[DEBUG] New photo stored at path: ' . $path);
                $user->photo = $path;
                Log::info('[DEBUG] User photo attribute set to: ' . $user->photo);
            } else {
                Log::info('[DEBUG] No photo file in request.');
            }

            Log::info('[DEBUG] User object before save:', $user->toArray());

            $saveResult = $user->save();

            Log::info('[DEBUG] Save result: ' . ($saveResult ? 'true' : 'false'));
            // Let's get a fresh instance from DB to be 100% sure
            $freshUser = $user->fresh();
            Log::info('[DEBUG] Fresh user from DB:', $freshUser->toArray());


            Log::info('Customer profile updated successfully', [
                'user_id' => $user->user_id,
                'updated_fields' => $user->getDirty(),
            ]);

            return Redirect::route('customer.profile.edit')->with('success', 'បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដោយជោគជ័យ!');
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