<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use Session; 
use Validator;
use Event;
use App\Http\Controllers\Controller;
  
class RegisterController extends Controller
{ 
	public function store(Request $request)
    {   
		$input = $request->all();
		 
		$rules = User::$rules;
		$messages = User::$messages;
		$validator = Validator::make($input, $rules,$messages);
		
		if ($validator->fails()) {
			return json_encode(['status' => 422,'message' => $validator->errors()]);
		}
	      
		$input['timezone'] = \Helper::getTimeZoneFromIp()['timezone'];
		$input['country_code'] = \Helper::getTimeZoneFromIp()['countryCode'];
		$input['username'] = \Helper::getUserName($input['name'])['username'];
		 
		$user = User::create($input);
		$success  =  $user->createToken('MyApp')-> accessToken; 
		$user['token'] = $success;
		   
		\Auth::login($user);
		return json_encode(['status' => 200 ,'message' => 'Register successfully','user' => $user]);
		 
    }
	
}