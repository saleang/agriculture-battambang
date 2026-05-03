<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            // If no user is logged in, redirect to login.
            return redirect()->route('login');
        }

        // This checks if the user's account status is something other than 'active' or 'inactive' (e.g., 'banned').
        // If so, it logs them out and displays an error.
        if ($request->user()->status !== 'active' && $request->user()->status !== 'inactive') {
            $status = $request->user()->status;
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')
                ->with('error', 'Your account is ' . $status . '. Please contact support.');
        }

        // If the user's role is one of the allowed roles, let them proceed.
        if (in_array($request->user()->role, $roles)) {
            return $next($request);
        }

        // If the user is not in the allowed role list, redirect them based on their role.
        return match ($request->user()->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'seller' => redirect()->route('seller.dashboard'),
            'customer' => redirect()->route('home'),
            default => abort(403, 'You are not authorized to access this page.'),
        };
    }
}