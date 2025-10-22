<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;

class ChangePasswordController extends Controller
{ 
	public function store(Request $request)
	{  
		$input = $request->all();
		  
		$user = \Auth::user();
		if(!$user){
			return response()->json(['message' => 'Something went wrong!'], 422);
		}
		
		$rules = array(
			'current_password' => 'required',
			'new_password' => 'required|min:8|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/',
			'confirm_password' => 'required|same:new_password',
		);
		
		$messages = array(
			'current_password.required' => 'The current password field is required.',
			'new_password.regex' => 'The password must be at least one capital letter, one number, and one special character.',
			 
		);
		  
		$validator = Validator::make($input,$rules,$messages);
		if ($validator->fails()) {
			return response()->json(['message' => $validator->errors()], 422);
			 
		}	
		  
		$oldPass = $request->current_password;
		$newPassword = Hash::make($input['new_password']);
		  
	
		if (Hash::check($oldPass, $user->password)) {
			$user->password = $newPassword;
			$saveUser = $user->save();
			return response()->json(['message' => 'Password changed successfully.'], 200);
			  
		}else{
			return response()->json(['message' => ['current_password' => 'The current password you entered is incorrect. Please check your password and try again.']], 422);
			 
		}  
		  
	}	
}