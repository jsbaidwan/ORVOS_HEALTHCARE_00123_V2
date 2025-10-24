<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ObfuscateApiResponse
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Normalize env flag (accept "true"/"1"/true)
        $enabled = filter_var(env('LARAVEL_OBFUSCATE_CONDITION', false), FILTER_VALIDATE_BOOLEAN);
 
        if (! $enabled) {
            return $response;
        }

        // Only for /api/* JSON responses
        if (! $request->is('api/*')) {
            return $response;
        }

        $contentType = $response->headers->get('Content-Type') ?? '';
        if (stripos($contentType, 'application/json') === false) {
            return $response;
        }

        $body = (string) $response->getContent();
        if ($body === '') {
            return $response;
        }

        // Threshold in bytes to decide compress+base64 vs plain base64.
        // Configurable via env; default 100 KB
        $threshold = 102400;
  
		// Compress then base64-encode (better for large, compressible JSON)
		$compressed = gzencode($body, 6);
		
		if ($compressed === false) {
			// fallback to plain base64 if compression fails
			$payload = base64_encode($body);
			$response->headers->set('X-Obfuscated', 'base64');
		} else {
			$payload = base64_encode($compressed);
			$response->headers->set('X-Obfuscated', 'base64+gz');
		}
         

        // Return as text/plain so clients treat it as text (they must decode)
        $response->setContent($payload);
        $response->headers->set('Content-Type', 'text/plain');
        // Remove Content-Length to avoid stale length; let server handle it
        $response->headers->remove('Content-Length');

        return $response;
    }
}
