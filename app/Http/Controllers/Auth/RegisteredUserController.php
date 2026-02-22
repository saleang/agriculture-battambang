<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    // public function store(Request $request)
    // {
    //     Log::info('Registration attempt', ['data' => $request->except('password', 'password_confirmation')]);

    //     $validated = $request->validate([
    //         'username' => 'required|string|max:255',
    //         'email' => 'required|email|unique:users,email',
    //         'phone' => 'required|string|min:9|max:10|regex:/^[0-9]+$/|unique:users,phone',
    //         'password' => 'required|min:8|confirmed',
    //         'role' => 'required|in:customer,seller',
    //         'farm_name' => 'required_if:role,seller|string|max:255',
    //         'province_id' => 'required_if:role,seller|exists:provinces,province_id',
    //         'district_id' => 'required_if:role,seller|exists:districts,district_id',
    //         'commune_id' => 'nullable|exists:communes,commune_id',
    //         'village_id' => 'nullable|exists:villages,village_id',
    //         'description' => 'nullable|string|max:1000',
    //     ]);

    //     // Create user
    //     $user = User::create([
    //         'username' => $validated['username'],
    //         'email' => $validated['email'],
    //         'phone' => $validated['phone'],
    //         'role' => $validated['role'],
    //         'status' => 'active',
    //         'password' => Hash::make($validated['password']),
    //     ]);

    //     Log::info('User created', ['user_id' => $user->user_id, 'role' => $user->role]);

    //     // If role is seller, create Seller details
    //     if ($validated['role'] === 'seller') {
    //         Seller::create([
    //             'user_id' => $user->user_id,
    //             'farm_name' => $validated['farm_name'],
    //             'province_id' => $validated['province_id'],
    //             'district_id' => $validated['district_id'],
    //             'commune_id' => $validated['commune_id'] ?? null,
    //             'village_id' => $validated['village_id'] ?? null,
    //             'description' => $validated['description'] ?? null,
    //         ]);

    //         Log::info('Seller profile created', ['user_id' => $user->user_id]);
    //     }

    //     event(new Registered($user));
    //     Auth::login($user);

    //     Log::info('User logged in', ['user_id' => $user->user_id, 'authenticated' => Auth::check()]);

    //     // Determine redirect URL
    //     $redirectUrl = $user->role === 'seller'
    //         ? route('seller.dashboard')
    //         : route('customer.dashboard');

    //     Log::info('Redirecting to', ['url' => $redirectUrl]);

    //     // Return proper redirect for Inertia
    //     return to_route($user->role === 'seller' ? 'seller.dashboard' : 'customer.dashboard');
    // }
    public function store(Request $request)
    {
        Log::info('Registration attempt', ['data' => $request->except('password', 'password_confirmation')]);

        // លុប empty strings ចេញពី request មុនពេល validate
        $cleanedData = collect($request->all())->map(function ($value) {
            return $value === '' ? null : $value;
        })->toArray();

        $request->merge($cleanedData);

        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|min:9|max:10|regex:/^[0-9]+$/|unique:users,phone',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:customer,seller',
            'farm_name' => 'required_if:role,seller|nullable|string|max:255',
            'province_id' => 'required_if:role,seller|nullable|exists:provinces,province_id',
            'district_id' => 'required_if:role,seller|nullable|exists:districts,district_id',
            'commune_id' => 'nullable|exists:communes,commune_id',
            'village_id' => 'nullable|exists:villages,village_id',
            'description' => 'nullable|string|max:1000',
        ]);

        // Create user
        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        Log::info('User created', ['user_id' => $user->user_id, 'role' => $user->role]);

        // If role is seller, create Seller details
        if ($validated['role'] === 'seller') {
            Seller::create([
                'user_id' => $user->user_id,
                'farm_name' => $validated['farm_name'] ?? null,
                'province_id' => $validated['province_id'] ?? null,
                'district_id' => $validated['district_id'] ?? null,
                'commune_id' => $validated['commune_id'] ?? null,
                'village_id' => $validated['village_id'] ?? null,
                'description' => $validated['description'] ?? null,
            ]);

            Log::info('Seller profile created', ['user_id' => $user->user_id]);
        }

        event(new Registered($user));
        Auth::login($user);

        Log::info('User logged in', ['user_id' => $user->user_id, 'authenticated' => Auth::check()]);

        // Redirect based on role
        if ($user->role === 'seller') {
            return redirect()->route('seller.dashboard');
        }

        return redirect()->route('home');
    }

    public function checkPhone(Request $request)
    {
        $phone = $request->query('phone');
        if (!$phone) {
            return response()->json(['available' => null]);
        }

        $exists = User::where('phone', $phone)->exists();
        return response()->json(['available' => !$exists]);
    }

    public function checkEmail(Request $request)
    {
        $email = $request->query('email');
        if (!$email) {
            return response()->json(['available' => null]);
        }

        $exists = User::where('email', $email)->exists();
        return response()->json(['available' => !$exists]);
    }
}
