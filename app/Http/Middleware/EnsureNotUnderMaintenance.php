<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotUnderMaintenance
{
    /**
     * When maintenance mode is on, learners are shown a notice while admins and
     * super admins keep full access (so they can turn it back off).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::get('maintenance_mode', '0') === '1' && optional($request->user())->role === 'learner') {
            $response = Inertia::render('maintenance', [
                'siteName' => Setting::get('site_name', config('app.name')),
            ])->toResponse($request);

            // 503 for direct/full page loads (correct HTTP semantics); 200 for
            // Inertia XHR visits so the SPA swaps the page instead of erroring.
            if (! $request->header('X-Inertia')) {
                $response->setStatusCode(503);
            }

            return $response;
        }

        return $next($request);
    }
}
