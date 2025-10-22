<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Laravel\Passport\Passport;
use App\Guards\PassportTokenGuard;
use League\OAuth2\Server\ResourceServer;
use Laravel\Passport\TokenRepository;
use Laravel\Passport\ClientRepository;
use Illuminate\Support\Facades\Auth;
use Laravel\Passport\PassportUserProvider;
use Illuminate\Http\Request;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
		'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
		$this->registerPolicies();
		
		Passport::tokensExpireIn(\Helper::tokensExpireIn()['token_expire_in']);
		Passport::personalAccessTokensExpireIn(\Helper::tokensExpireIn()['token_expire_in']);		
		//Passport::routes();
		
		Auth::extend('custom-passport', function ($app, $name, array $config) {
			// Original user provider, e.g. EloquentUserProvider
			$defaultUserProvider = Auth::createUserProvider($config['provider']);
			
			// Hasher instance
			$hasher = $app['hash'];

			// Create PassportUserProvider with 2 args
			$userProvider = new PassportUserProvider($defaultUserProvider, $hasher);

			return new \App\Guards\PassportTokenGuard(
				$app->make(ResourceServer::class),
				$userProvider,
				$app->make(TokenRepository::class),
				$app->make(ClientRepository::class),
				$app->make('encrypter'),
				$app->make(Request::class)
			);
		});
    }
}
