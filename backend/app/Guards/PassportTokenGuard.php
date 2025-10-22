<?php

namespace App\Guards;

use Laravel\Passport\Guards\TokenGuard;
use Illuminate\Http\Request;
use Laravel\Passport\TokenRepository;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\PassportUserProvider;
use League\OAuth2\Server\ResourceServer;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Encryption\Encrypter;
use Lcobucci\JWT\Configuration;
use Carbon\Carbon;

class PassportTokenGuard extends TokenGuard
{
    protected $jwtConfig;

    public function __construct(
        ResourceServer $server,
        PassportUserProvider $provider,
        TokenRepository $tokens,
        ClientRepository $clients,
        Encrypter $encrypter,
        Request $request
    ) {
        parent::__construct($server, $provider, $tokens, $clients, $encrypter, $request);

        // Setup JWT configuration for parsing tokens
        $this->jwtConfig = Configuration::forUnsecuredSigner();
    }

    public function user(Request $request = null)
    {
        $request = $request ?: request();
		
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return null;
        }

        // Parse token to get token ID (jti)
        $tokenId = $this->getTokenIdFromTokenString($bearerToken);
        if (!$tokenId) {
            return null;
        }

        // Find token in DB using TokenRepository for better abstraction
        $token = $this->tokens->find($tokenId);
 
        if (!$token || $token->revoked || Carbon::parse($token->expires_at)->isPast()) {
            return null;
        }
	 
		// Extend token expiration by 1 day (or any duration you want)
		$token->expires_at = \Helper::tokensExpireIn()['token_expire_in'];
		$token->save();
		   
        // Get user model via UserProvider
        return $this->provider->retrieveById($token->user_id);
    }

    protected function getTokenIdFromTokenString(string $bearerToken)
    {
        try {
            $token = $this->jwtConfig->parser()->parse($bearerToken);
            return $token->claims()->get('jti');
        } catch (\Exception $e) {
            return null;
        }
    }
}
