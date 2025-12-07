<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    // public function store(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'username' => 'required|string|max:50|unique:users,username',
    //         'email' => 'required|string|lowercase|email|max:100|unique:users,email',
    //         'password' => ['required', 'confirmed', Rules\Password::defaults()],
    //         'role' => 'required|in:seller,customer',
    //         'phone' => 'required|string|max:20',
    //         'farm_name' => 'required_if:role,seller|nullable|string|max:100',
    //         'location_district' => 'required_if:role,seller|nullable|string|max:100',
    //         'description' => 'nullable|string|max:1000',
    //     ]);

    //     $user = User::create([
    //         'username' => $request->username,
    //         'email' => $request->email,
    //         'password' => Hash::make($request->password),
    //         'role' => $request->role,
    //         'phone' => $request->phone,
    //         'status' => 'active',
    //     ]);

    //     // Create seller profile if role is seller
    //     if ($request->role === 'seller') {
    //         Seller::create([
    //             'user_id' => $user->user_id,
    //             'farm_name' => $request->farm_name,
    //             'location_district' => $request->location_district,
    //             'description' => $request->description,
    //         ]);
    //     }

    //     event(new Registered($user));

    //     Auth::login($user);

    //     return redirect('/dashboard');
    // }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:3',
            'role' => 'required|in:customer,seller',
            'phone' => 'nullable|string|max:20',
        ]);

        // Create user
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => 'active',
            'password' => Hash::make($request->password),
        ]);

        // If role is seller, create Seller details also
        if ($request->role === 'seller') {
            Seller::create([
                'user_id' => $user->user_id,      // FIX: use id, not user_id
                'farm_name' => $request->farm_name ?? 'Unknown Farm',
                'location_district' => $request->location_district ?? null,
                'description' => $request->description ?? null,
            ]);
        }

        // return response()->json([
        //     'message' => 'Registered successfully.',
        //     'user' => $user,
        // ]);
        event(new Registered($user));

        Auth::login($user);
        // return redirect()->route('home');
        // return redirect()->back()->with('success', 'Registered successfully.');
        if($user->role === 'seller')
            return redirect('/seller/dashboard');
        else
            return redirect('/customer/dashboard');
        // return redirect()->route('login');
        // event(new Registered($user));

        // Auth::login($user);
        // // regenerate session to persist login for XHR requests and prevent fixation
        // $request->session()->regenerate();

        // Log::info('RegisterController created user', ['user_id' => $user->user_id, 'auth_check' => Auth::check()]);

        // // Redirect with 303 to instruct Inertia to follow as GET after POST
        // return redirect()->route('customer.dashboard')->setStatusCode(303);

    }
}


