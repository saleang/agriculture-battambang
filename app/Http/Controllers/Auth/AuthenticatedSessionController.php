<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            'canRegister'      => true,
            'status'           => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // Determine if the input is email or phone.
        $loginValue = $request->input('email');
        $loginField = filter_var($loginValue, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        // Find user by email or phone.
        $user = User::where($loginField, $loginValue)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => $loginField === 'email'
                    ? 'អ៊ីមែលមិនត្រឹមត្រូវ!'
                    : 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ!',
            ]);
        }

        if (!Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ!',
            ]);
        }

        if ($user->status !== 'active') {
            $statusMessage = match ($user->status) {
                'inactive' => 'គណនីរបស់អ្នកត្រូវបានដាក់ក្នុងស្ថានភាពអសកម្ម។​ សូមទំនាក់ទំនងទៅកាន់អ្នកគ្រប់គ្រង។',
                'banned' => 'គណនីរបស់អ្នកត្រូវបានបិទ។​ សូមទំនាក់ទំនងទៅកាន់អ្នកគ្រប់គ្រង។',
                default => 'គណនីរបស់អ្នកមិនអាចចូលប្រើប្រាស់បានទេ។ សូមទំនាក់ទំនងទៅកាន់អ្នកគ្រប់គ្រង។',
            };

            throw ValidationException::withMessages(['email' => $statusMessage]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        $user->updateLastLogin();

        if ($user->role === 'seller') {
            return redirect()->intended('/seller/dashboard');
        }

        if ($user->role === 'admin') {
            return redirect()->intended('/admin/dashboard');
        }

        return redirect()->intended('/customer/dashboard');
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
