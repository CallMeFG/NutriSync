<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            abort(403, 'Anda tidak memiliki otorisasi untuk mengakses halaman ini.');
        }

        $userRole = $request->user()->role instanceof UserRole
            ? $request->user()->role->value
            : (string) $request->user()->role;

        if (! in_array($userRole, $roles, true)) {
            abort(403, 'Anda tidak memiliki otorisasi untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
