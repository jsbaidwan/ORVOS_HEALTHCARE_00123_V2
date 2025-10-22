<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Validation\ValidationException;
use Validator;
use App\Helpers\cArray;
use App\Notifications\ResetPassword;

class ForgotPasswordController extends Controller
{
   /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }
	
	 /**
     * Send a reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {   
        $valid = $this->validateEmail($request);
        if( $valid ){
			return response()->json(['message' => $this->validateEmail($request)], 422);
		}
		
		$input = $request->all();
		 
		$user = $this->broker()->getUser($this->credentials($request));

		if (!$user) {
			return $this->sendResetLinkFailedResponse($request, Password::INVALID_USER);
		}

		$token = $this->broker()->createToken($user);

		// Send the notification with the app_url
		$appUrl = NULL;
		if(!empty($input['app_url'])){
			$appUrl = $input['app_url'];
		}
		$user->notify(new ResetPassword($token, $appUrl));

		return $this->sendResetLinkResponse($request, Password::RESET_LINK_SENT);
	
		 
        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
		
		
        // $response = $this->broker()->sendResetLink(
            // $this->credentials($request)
        // );

        // return $response == Password::RESET_LINK_SENT
                    // ? $this->sendResetLinkResponse($request, $response)
                    // : $this->sendResetLinkFailedResponse($request, $response);
    }

    /**
     * Validate the email for the given request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    protected function validateEmail(Request $request)
    {   
         $validator = Validator::make($request->all(), [
             'email' => 'required|email'
        ]);
 
        if ($validator->fails()) {
            return $validator->errors();    
        }
    }

    /**
     * Get the needed authentication credentials from the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    protected function credentials(Request $request)
    {	
		$rolesResult = \Helper::getRoles();
		$roleIds = [];

		if (isset($rolesResult['roles']['data']) && is_iterable($rolesResult['roles']['data'])) {
			$roleIds = collect($rolesResult['roles']['data'])
				->where('id', '!=', 1)
				->pluck('id')
				->toArray();
		}
		return array_merge($request->only('email'), ['active' => 1,'role_id' => $roleIds]);
		//return array_merge($request->only('email'), ['active' => 1,'role_id' => [2]]);
       // return $request->only('email');
    }

    /**
     * Get the response for a successful password reset link.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $response
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    protected function sendResetLinkResponse(Request $request, $response)
    { 
		return response()->json(['message' => trans($response)], 200); 
		 
        // return back()->with('status', trans($response));
    }

    /**
     * Get the response for a failed password reset link.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $response
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    protected function sendResetLinkFailedResponse(Request $request, $response)
    {  
		return response()->json(['message' =>  ['email' => trans($response)]], 422); 
		 
        // return back()
                // ->withInput($request->only('email'))
                // ->withErrors(['email' => trans($response)]);
    }

    /**
     * Get the broker to be used during password reset.
     *
     * @return \Illuminate\Contracts\Auth\PasswordBroker
     */
    public function broker()
    {
        return Password::broker();
    }
}
