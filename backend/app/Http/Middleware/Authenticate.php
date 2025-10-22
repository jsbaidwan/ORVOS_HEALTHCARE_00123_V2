<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Closure;
   
class Authenticate extends Middleware
{
   /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
	{
		// Always return JSON for API requests
		if ($request->is('api/*')) {
			abort(response()->json(['message' => 'Unauthorized'], 401));
		}

		// For web routes, redirect to login page
		return route('login');
	}

	 
}
