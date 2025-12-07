<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Seller;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request)
    {
        Log::info('RegisterController@store called', ['input' => $request->all()]);
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'required|string|max:20',
            'role' => 'required|in:customer,seller',
            'farm_name' => 'required_if:role,seller|nullable|string|max:255',
            'location_district' => 'required_if:role,seller|nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'status' => 'active',
        ]);

        if ($validated['role'] === 'seller') {
            Seller::create([
                'user_id' => $user->user_id,
                'farm_name' => $validated['farm_name'],
                'location_district' => $validated['location_district'],
                'description' => $validated['description'] ?? null,
            ]);
        }

        event(new Registered($user));

        Auth::login($user);
        // regenerate session to persist login for XHR requests and prevent fixation
        $request->session()->regenerate();

        Log::info('RegisterController created user', ['user_id' => $user->user_id, 'auth_check' => Auth::check()]);

        // Redirect with 303 to instruct Inertia to follow as GET after POST
        return redirect()->route('dashboard')->setStatusCode(303);
    }
}
