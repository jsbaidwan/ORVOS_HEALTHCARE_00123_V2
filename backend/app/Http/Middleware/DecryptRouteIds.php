<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

class DecryptRouteIds
{
    public function handle(Request $request, Closure $next)
    {
		if(\Helper::hasEncrypt() == false){
			 return $next($request);
		}
		
        $route = $request->route();
		
        // Check whether a route has been matched
        if ($route instanceof Route) {

            foreach ($route->parameters() as $key => $value) {

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