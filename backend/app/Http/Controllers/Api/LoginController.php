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
use Socialite;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Response;
use Illuminate\Contracts\Cache\Repository as Cache;
use App\Http\Controllers\Auth\LoginController as AuthLoginController;

class LoginController extends Controller
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
			
			return response()->json(['message' => ['email' => $this->sendLockoutResponse($request)]],422,[],JSON_UNESCAPED_SLASHES);

			//return json_encode(['status' => 422,'message' => ['email' => $this->sendLockoutResponse($request)]],JSON_UNESCAPED_SLASHES);
            //return $this->sendLockoutResponse($request);
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
            'password' => 'required|string',
			
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
		? 'email'
		: 'name';
  
		$rolesResult = \Helper::getRoles();
		
		$roleIds = [];
		
		$user = User::where($field, $request->get($this->username()))->first();
		$userRoleId = $user ? $user->role_id : null;
		
		$isAdmin = str_contains($request->path(), 'admin');
 
		if ($rolesResult) {
			if (isset($rolesResult['roles']) && is_iterable($rolesResult['roles'])) {
				$roleIds = collect($rolesResult['roles'])
					->where('id', '!=', 1)
					->pluck('id')
					->toArray();
				 
			}
		} 
		
		if($isAdmin){
			$roleIds = [1];
		}
		  
		$data = [
			$field => $request->get($this->username()),
			'password' => $request->password,
			'active' => 1,
			'role_id' => $roleIds,
			 
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
        
		$user = Auth::user(); 
		  
		$userData = $this->user($user, $input); 
		 
		$data = array('status' => 200,'message' => 'Login Successfully!','auth' => $userData,'redirect_url' => redirect()->intended()->getTargetUrl());
		return response()->json($data,200,[],JSON_UNESCAPED_SLASHES);
		//return json_encode($data,JSON_UNESCAPED_SLASHES);
       // return $this->authenticated($request, $this->guard()->user())
               // ?: redirect()->intended($this->redirectPath());
    }
	
	function user($user,$input)
	{     
		$user->load('role');
		$success  =  $user->createToken('MyApp')-> accessToken; 
		$user['token'] = $success;
		  
		return $user;
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
		//return json_encode(['status' => 422,'message' => ['email' => trans('auth.failed')]]);
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
        return 'email';
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
		 
		if(\Session::has('my-auth-token')){
			$bToken = \Session::get('my-auth-token');
			$token =  app(Parser::class)->parse($bToken)->claims()->get('jti'); 
			
			$hasToken =  AuthAccessToken::with('user')->where('id',$token)->first();
		  
			if($hasToken){
				$hasToken->delete();
			}
		}
		   
		return response()->json([],200);
		//return json_encode(['status' => 200]);
        //return $this->loggedOut($request) ?: redirect('/');
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
