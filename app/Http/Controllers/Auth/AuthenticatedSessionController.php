<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => true,
            'canRegister' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        // Determine if the input is email or phone
        $loginField = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        // Find user by email or phone
        $user = User::where($loginField, $request->email)->first();

        // Check if user exists
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => $loginField === 'email'
                    ? 'This email address is not registered.'
                    : 'This phone number is not registered.',
            ]);
        }

        // Check if password is correct
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'The password is incorrect.',
            ]);
        }

        // Check if user is active
        if ($user->status !== 'active') {
            $statusMessage = match ($user->status) {
                'inactive' => 'Your account is inactive. Please contact support.',
                'banned' => 'Your account has been banned. Please contact support.',
                default => 'Your account status does not allow login. Please contact support.'
            };

            throw ValidationException::withMessages([
                'email' => $statusMessage,
            ]);
        }

        // Log the user in
        Auth::login($user, $request->boolean('remember'));

        // Update last login
        $user->updateLastLogin();

        // Regenerate session
        $request->session()->regenerate();

        // Redirect based on role
        if ($user->role === 'seller') {
            return redirect()->intended('/seller/dashboard');
        } elseif ($user->role === 'admin') {
            return redirect()->intended('/admin/dashboard');
        } else {
            return redirect()->intended('/customer/dashboard');
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
