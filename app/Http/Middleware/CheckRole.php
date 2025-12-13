<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }
        // error is user'status is inactive. so need to change to banned.
        if ($request->user()->status !== 'active' && $request->user()->status !== 'inactive') {
            auth()->Auth::logout();
            return redirect()->route('login')
                ->with('error', 'Your account is ' . $request->user()->status);
        }

        if (!in_array($request->user()->role, $roles)) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
