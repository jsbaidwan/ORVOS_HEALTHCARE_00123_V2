<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    { 
		if (!\Auth::check()) {
			 return redirect()->route('login');
		}
		// Get the authenticated user's role
        $userRole = intval(\Auth::user()->role_id);
		   
        if (!in_array($userRole, $roles)) {
            // Abort with a 404 Page Not Found response if the user is not authorized
            return abort(404);
        }
        return $next($request);
    }
}
