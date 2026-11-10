<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

class DecryptRouteIds
{
	/**
	 * Route parameters that are not encrypted model ids (tokens, signed links).
	 */
	protected array $exceptParams = ['token'];

	protected array $exceptUris = [
		'api/patients/guest/verify/{id}',
	];

    public function handle(Request $request, Closure $next)
    {
		if(\Helper::hasEncrypt() == false){
			 return $next($request);
		}
		
        $route = $request->route();
		
        // Check whether a route has been matched
        if ($route instanceof Route && !in_array($route->uri(), $this->exceptUris, true)) {

            foreach ($route->parameters() as $key => $value) {

				if (in_array($key, $this->exceptParams, true)) {
					continue;
				}

				// Plain numeric ids are rejected so ids cannot be changed manually in the url
				if (is_int($value) || (is_string($value) && ctype_digit($value))) {
					return response()->json(['message' => 'The requested record was not found.'], 404);
				}

                if (is_string($value)) {
					
                    try {
                        $decrypted = \Helper::decryptData($value)['decrypt'];
 
                        $route->setParameter($key, $decrypted);

                    } catch (\Throwable $e) {
                        // Keep original value if it is not encrypted
                    }
                }
            }
        }

        return $next($request);
    }
}
