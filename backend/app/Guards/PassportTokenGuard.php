<?php

namespace App\Guards;

use Carbon\Carbon;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Http\Request;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\Guards\TokenGuard;
use Laravel\Passport\PassportUserProvider;
use Laravel\Passport\TokenRepository;
use League\OAuth2\Server\ResourceServer;

class PassportTokenGuard extends TokenGuard
{
    protected TokenRepository $tokens;

    public function __construct(
        ResourceServer $server,
        PassportUserProvider $provider,
        TokenRepository $tokens,
        ClientRepository $clients,
        Encrypter $encrypter,
        Request $request
    ) {
        parent::__construct(
            $server,
            $provider,
            $clients,
            $encrypter,
            $request
        );

        $this->tokens = $tokens;
    }

    public function user(): ?Authenticatable
    {
        $request = request();
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return null;
        }

        $tokenId = $this->getTokenIdFromTokenString($bearerToken);

        if (!$tokenId) {
            return null;
        }

        $token = \Laravel\Passport\Passport::token()->find($tokenId);
		
        if (
            !$token ||
            $token->revoked ||
            !$token->expires_at ||
            Carbon::parse($token->expires_at)->isPast()
        ) {
            return null;
        }

        // Extend expiration only after validating the token.
        $token->expires_at = \Helper::tokensExpireIn()['token_expire_in'];
		 
        $token->save();

        return $this->provider->retrieveById($token->user_id);
    }

    protected function getTokenIdFromTokenString(string $bearerToken): ?string
    {
        try {
            // Decode only to extract jti. Passport's ResourceServer
            // is responsible for cryptographic bearer-token validation.
            $parts = explode('.', $bearerToken);

            if (count($parts) !== 3) {
                return null;
            }

            $payload = json_decode(
                JWT::urlsafeB64Decode($parts[1]),
                true,
                512,
                JSON_THROW_ON_ERROR
            );

            return isset($payload['jti']) && is_string($payload['jti'])
                ? $payload['jti']
                : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
