<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;

$PRFIX_SUPER_ADMIN = \Helper::prefix('1')['prefix'];
$PRFIX_ORVOS_USER = \Helper::prefix('2')['prefix'];


Route::middleware('auth:api')->group(function () {
	Route::resource('users','App\Http\Controllers\Api\UserController');
	Route::post('users/{id}', 'App\Http\Controllers\Api\UserController@update');
	Route::resource('change-password', 'App\Http\Controllers\Api\ChangePasswordController');
	Route::resource('roles', 'App\Http\Controllers\Api\RoleController');
	
});
  
Route::get('countries', function(){
	$countries = \Helper::getCountries()['countries'];
	return response()->json(['countries' => $countries],200,[],JSON_UNESCAPED_SLASHES);
}); 

Route::get('get-recaptcha-keys', function(){
	$siteKey = \Helper::encodeData(\Helper::recaptchaCredentails('v2')['site_key'])['encoded'];
	$secretKey = \Helper::encodeData(\Helper::recaptchaCredentails('v2')['secret_key'])['encoded'];
	
	$recaptchaCredentails = [
		'site_key' => $siteKey,
		'secret_key' => $secretKey,
	];
	
	return response()->json(['recaptchaCredentails' => $recaptchaCredentails],200,[],JSON_UNESCAPED_SLASHES);
}); 

Route::post('admin/login', 'App\Http\Controllers\Api\LoginController@login');
Route::post('login', 'App\Http\Controllers\Api\LoginController@login');
Route::resource('register', 'App\Http\Controllers\Api\RegisterController');
Route::post('password/email','App\Http\Controllers\Api\ForgotPasswordController@sendResetLinkEmail');
Route::post('password/reset', 'App\Http\Controllers\Api\ResetsPasswords@reset');
