<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    /** Block deactivated accounts even when they still hold an old session. */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->isActive()) {
            if ($request->expectsJson()) {
                // A disabled mobile account must not keep using an existing
                // personal-access token. Revoke every token immediately.
                $request->user()->tokens()->delete();

                return response()->json([
                    'message' => 'Your account is inactive. Please contact an administrator.',
                ], 403);
            }

            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'Your account is inactive. Please contact an administrator.');
        }

        return $next($request);
    }
}
