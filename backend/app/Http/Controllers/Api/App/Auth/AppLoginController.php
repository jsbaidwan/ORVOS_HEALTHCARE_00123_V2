<?php

namespace App\Http\Controllers\Api;
 
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Validation\ValidationException;
use Session; 
use Validator;
use Auth;
use Lcobucci\JWT\Parser;
use App\Models\AuthAccessToken;
use App\Models\AppSession;
use Socialite;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Response;
use Illuminate\Contracts\Cache\Repository as Cache;
 
class AppLoginController extends Controller
{
     /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
	protected $cache;
	public function __construct(Cache $cache)
    {
        $this->cache = $cache;
    }

	
    public function login(Request $request)
    { 
		$valid = $this->validateLogin($request);
        if( $valid ){
			return response()->json(['message' => $this->validateLogin($request)], 422);
			//return json_encode(['status' => 422,'message' => $this->validateLogin($request)]);
        }
        
        // If the class is using the ThrottlesLogins trait, we can automatically throttle
        // the login attempts for this application. We'll key this by the username and
        // the IP address of the client making these requests into this application.
        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
			
			return response()->json(['message' => ['clinic_code' => $this->sendLockoutResponse($request)]],422,[],JSON_UNESCAPED_SLASHES);

        }
		 

		  
        if ($this->attemptLogin($request)) {
			
            return $this->sendLoginResponse($request);
        }

        // If the login attempt was unsuccessful we will increment the number of attempts
        // to login and redirect the user back to the login form. Of course, when this
        // user surpasses their maximum number of attempts they will get locked out.
        //$this->incrementLoginAttempts($request);

        return $this->sendFailedLoginResponse($request);
    }
	
	protected function hasTooManyLoginAttempts(Request $request)
    {
		/***** check number of hit ****/ 
		if (RateLimiter::hit($this->throttleKey($request)) > 5) {
			   
			 return true;
		}
        
    }
	
	protected function throttleKey(Request $request)
    {
        return \Str::transliterate(\Str::lower($request->input($this->username())).'|'.$request->ip());
    }
	
	protected function fireLockoutEvent(Request $request)
    {
          
    }
	  
	protected function sendLockoutResponse(Request $request)
    {
        // $seconds = $this->limiter()->availableIn(
            // $this->throttleKey($request)
        // );
		$key = $this->cleanRateLimiterKey($this->throttleKey($request));
		 
		$mytime = \Carbon\Carbon::now();
		$cTime = $mytime->timestamp;
	
		$seconds = max(0, $this->cache->get($key.':timer') - $cTime);
		 	 
        $validation =  ValidationException::withMessages([
            $this->username() => [trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ])],
        ])->status(Response::HTTP_TOO_MANY_REQUESTS);
		
		return $validation->getMessage();
    }
	

    /**
     * Clean the rate limiter key from unicode characters.
     *
     * @param  string  $key
     * @return string
     */
    protected function cleanRateLimiterKey($key)
    {
        return preg_replace('/&([a-z])[a-z]+;/i', '$1', htmlentities($key));
    }
	 
    /**
     * Validate the user login request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateLogin(Request $request)
    { 
        $validator = Validator::make($request->all(), [
			$this->username() => 'required|string',
            'clinic_password' => 'required|string',
			
        ]);
 
        if ($validator->fails()) {
            return $validator->errors();    
        }
    }

    /**
     * Attempt to log the user into the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function attemptLogin(Request $request)
    {    
		return true;
        return $this->guard()->attempt(
            $this->credentials($request), $request->filled('remember')
        );
    }

    /**
     * Get the needed authorization credentials from the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    protected function credentials(Request $request)
    {      
		$field = filter_var($request->get($this->username()), FILTER_VALIDATE_EMAIL)
		? 'clinic_code'
		: 'clinic_code';

		$data = [
			$field => $request->get($this->username()),
			'clinic_password' => $request->clinic_password,
		];
		  
		return $data;
	 
    }

    /**
     * Send the response after the user was authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    
	 
	protected function sendLoginResponse(Request $request)
	{
		$input = $request->all();
  
		// Retrieve clinic details using your existing helper.
		$result = \Helper::getClinicByCode($input['clinic_code']);
		$clinic = $result['clinic'] ?? null;
		 
		if (!$clinic || !$clinic->additionalSetting) {
			return response()->json([
				'status'  => 422,
				'message' => 'TED app access is not configured for this clinic.',
			], 422);
		}

		$settings = $clinic->additionalSetting;

		if (empty($settings->data)) {
			return response()->json([
				'status'  => 422,
				'message' => 'TED app access is not configured for this clinic.',
			], 422);
		}

		$data = json_decode($settings->data, true);

		if (!is_array($data)) {
			return response()->json([
				'status'  => 422,
				'message' => 'Invalid clinic settings.',
			], 422);
		}

		// Check whether TED app access is enabled.
		if (($data['ted_app_cred']['has_ted_app_access'] ?? 'off') !== 'on') {
			return response()->json([
				'status'  => 422,
				'message' => 'TED app access is disabled for this clinic.',
			], 422);
		}

		$clinicCode = $data['ted_app_cred']['app_clinic_code'] ?? '';
		$clinicPassword = $data['ted_app_cred']['app_clinic_password'] ?? '';
		 
		// Validate TED app credentials.
		if (
			$clinicCode !== $input['clinic_code'] ||
			$clinicPassword !== $input['clinic_password']
		) {
			return response()->json([
				'status'  => 422,
				'message' => 'Invalid clinic code or password.',
			], 422);
		}

		// Generate the authentication token.
		$userData = $this->user($clinic, $input);
		
		$tokenId = $userData['token_id'] ?? NULL;
		
		if (!empty($input['device_info'])) {
			$deviceInfo = $input['device_info'];

			if (is_string($deviceInfo)) {
				$decoded = json_decode($deviceInfo, true);

				if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
					$deviceInfo = $decoded;
				}
			}

			if (is_array($deviceInfo)) {
				$deviceInfo['ip_address'] = $request->ip();

				if(!empty($tokenId)){
					AppSession::create([
						'oauth_access_tokens_id' => $tokenId,
						'device_info' => json_encode($deviceInfo),
					]);
				}
				
				 
			}
		}
		 
		unset($userData['token_id']);

		return response()->json([
			'status'  => 200,
			'message' => 'Login successful!',
			'auth'    => $userData,
		], 200, [], JSON_UNESCAPED_SLASHES);
	}


	protected function user($clinic, $input)
	{
		$tokenResult = $clinic->createToken('TED');
		$tokenId = $tokenResult->token->id;

		return [
			'clinic_id'   => $clinic->id,
			'clinic_name' => $clinic->name,
			'clinic_code' => $input['clinic_code'],
			'token'       => $tokenResult->accessToken,
			'token_type'  => 'Bearer',
			'token_id'    => $tokenId,
		];
	}

	
	public function impersonateLoginResponse(Request $request,$user)
    {
		$input = $request->all();
		$userData = $this->user($user, $input);
		$data = array('status' => 200,'message' => 'Login Successfully!','auth' => $userData,'redirect_url' => redirect()->intended()->getTargetUrl());
		return response()->json($data,200,[],JSON_UNESCAPED_SLASHES);		
       
    }

    /**
     * The user has been authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        //
    }

    /**
     * Get the failed login response instance.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function sendFailedLoginResponse(Request $request)
    { 
		return response()->json(['message' => [$this->username() => trans('auth.failed')]],422,[],JSON_UNESCAPED_SLASHES);
        throw ValidationException::withMessages([
			 
			$this->username() => [trans('auth.failed')],
        ]);
    }

    /**
     * Get the login username to be used by the controller.
     *
     * @return string
     */
    public function username()
    {
        return 'clinic_code';
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        $this->guard()->logout();
		 
		return response()->json([],200);
	 
    }

    /**
     * The user has logged out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
     */
    protected function loggedOut(Request $request)
    {
        //
    }

    /**
     * Get the guard to be used during authentication.
     *
     * @return \Illuminate\Contracts\Auth\StatefulGuard
     */
    protected function guard()
    {
        return Auth::guard();
    } 
	 
	 
}
