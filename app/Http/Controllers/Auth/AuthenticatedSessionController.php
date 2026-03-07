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
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $input = trim($request->email);

        // កំណត់ว่า input ជា email ឬ phone
        $loginField = filter_var($input, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        // រក User
        $user = User::where($loginField, $input)->first();

        // User មិនមាន
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => $loginField === 'email'
                    ? 'អ៊ីមែលនេះមិនត្រូវបានចុះឈ្មោះទេ។'
                    : 'លេខទូរស័ព្ទនេះមិនត្រូវបានចុះឈ្មោះទេ។',
            ]);
        }

        // ⚠️ ត្រូវវាស់ hash ផ្ទាល់ពី DB ដោយ getRawOriginal
        // ព្រោះ User model មាន cast 'hashed' ដូច្នេះ $user->password បាន decode ហើយ
        // Hash::check() ត្រូវប្រើ raw hash ពី DB
        $hashedPassword = $user->getRawOriginal('password');

        if (! Hash::check($request->password, $hashedPassword)) {
            throw ValidationException::withMessages([
                'email' => 'អ៊ីមែល/លេខទូរស័ព្ទ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។',
            ]);
        }

        // ពិនិត្យ status
        if ($user->status !== 'active') {
            $msg = match ($user->status) {
                'inactive' => 'គណនីរបស់អ្នកមិនទាន់ active ទេ។ សូមទាក់ទង support។',
                'banned'   => 'គណនីរបស់អ្នកត្រូវបាន banned។ សូមទាក់ទង support។',
                default    => 'គណនីរបស់អ្នកមិនអាចចូលបាន។ សូមទាក់ទង support។',
            };

            throw ValidationException::withMessages(['email' => $msg]);
        }

        // Login ជោគជ័យ
        Auth::login($user, $request->boolean('remember'));

        $user->updateLastLogin();

        $request->session()->regenerate();

        // Redirect តាម role
        return match ($user->role) {
            'admin'  => redirect()->intended('/admin/dashboard'),
            'seller' => redirect()->intended('/seller/dashboard'),
            default  => redirect()->intended('/'),
        };
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