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
	Route::resource('clinic-groups', 'App\Http\Controllers\Api\ClinicGroupController');
	Route::resource('clinics', 'App\Http\Controllers\Api\ClinicController');
	Route::get('clinics/staff/{id}', 'App\Http\Controllers\Api\ClinicController@staff');
	Route::post('clinics/remove-clinic-staff','App\Http\Controllers\Api\ClinicController@rmvClinicStaff');
	Route::resource('patients', 'App\Http\Controllers\Api\PatientController');
	Route::post('patients/pdf/{id}','App\Http\Controllers\Api\PatientController@patientPdf');
	Route::post('send-pdf','App\Http\Controllers\Api\PatientController@sendPdf');
	Route::post('send-fax','App\Http\Controllers\Api\PatientController@sendFax');
	Route::post('send-dicom','App\Http\Controllers\Api\PatientController@sendDicom');
	Route::post('clone','App\Http\Controllers\Api\PatientController@clone');
	Route::post('remark/{id}','App\Http\Controllers\Api\PatientController@remark');
	Route::post('patients/export','App\Http\Controllers\Api\PatientController@exportPatients');
	Route::get('reports/clinic-patient','App\Http\Controllers\Api\ReportController@clinicPatient');
    Route::get('reports/orvos-doctor-review','App\Http\Controllers\Api\ReportController@orvosDoctorReview');
    Route::post('reports/get-doctor-states','App\Http\Controllers\Api\ReportController@getDoctorStates');
	 
	Route::get('get-permissions', function(Request $request){
		return \Helper::permission();
	});
	
	Route::post('archive', function(Request $request){
		
		$input = $request->all();
		if(!$input['module'] || !$input['id']){
			 
			return response()->json(['message' => 'The Module and id field is required.'],422,[],JSON_UNESCAPED_SLASHES); 
		}
		
		$fModule = ucwords(rtrim(str_replace('-', ' ', $input['module']), 's')); 
		$module = 'App\\Models\\' . str_replace(' ', '', $fModule);

		$moduleData = $module::find($input['id']);	
		if(!$moduleData){
			return response()->json(['message' => \Helper::alertMsg('archive',$fModule,'error')['message']], 404);
		}
		
		$moduleData->update(['is_archived' => 1]);
		
		\Log::save(
			$fModule.' Archived.',
			'The ' . $fModule . ' has been archived by ' . \Auth::user()->first_name . ' ' . \Auth::user()->last_name . '.',
			str_replace(' ', '', $fModule),
			$moduleData->id
		);
		
		return response()->json(['message' => \Helper::alertMsg('archive',$fModule,'success')['message']],200,[],JSON_UNESCAPED_SLASHES);
	});
	
	Route::post('unarchive', function(Request $request){
		
		$input = $request->all();
		if(!$input['module'] || !$input['id']){
			 
			return response()->json(['message' => 'The Module and id field is required.'],422,[],JSON_UNESCAPED_SLASHES); 
		}
		
		$fModule = ucwords(rtrim(str_replace('-', ' ', $input['module']), 's')); 
		$module = 'App\\Models\\' . str_replace(' ', '', $fModule);

		$moduleData = $module::find($input['id']);	
		if(!$moduleData){
			return response()->json(['message' => \Helper::alertMsg('unarchive',$fModule,'error')['message']], 404);
		}
		
		$moduleData->update(['is_archived' => 0]);
		$user = \Auth::user();
		\Log::save(
			$fModule.' Unarchived.',
			'The ' . $fModule . ' has been unarchived by ' . \Auth::user()->first_name . ' ' . \Auth::user()->last_name . '.',
			str_replace(' ', '', $fModule),
			$moduleData->id
		);
		return response()->json(['message' => \Helper::alertMsg('unarchive',$fModule,'success')['message']],200,[],JSON_UNESCAPED_SLASHES);
	});
	 
	
});
  
Route::get('countries', function(){
	$countries = \Helper::getCountries()['countries'];
	return response()->json(['countries' => $countries],200,[],JSON_UNESCAPED_SLASHES);
}); 

Route::get('states', function(){
	$states = \Helper::getStates(['country_id' => 231])['states'];
	return response()->json(['states' => $states],200,[],JSON_UNESCAPED_SLASHES);
}); 

Route::get('additional-data', function(Request $request){
	
	$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
	$isAdmin = false;
	if (!empty($input['user_id'])) {
		$userData = \Helper::getUserById($input['user_id']);
		$user = $userData['user'] ?? null;

		$isAdmin = ($user['role_id'] ?? null) == 1;
	}	
	 
	$additionalData = [
		'countries' => \Helper::getCountries()['countries'],
		'states' => \Helper::getStates(['country_id' => 231])['states'],
		'deviceTypes' => \Helper::getDeviceTypes(),
		'roles' => \Helper::getRoles($isAdmin)['roles'],
		'insuranceCarriers' => \Helper::insuranceCarriers(),
		'medicalConditions' => \Helper::getMedicalConditionLists(),
		'genders' => \Helper::getGenders(),
		'medicalHistories' => \Helper::getMedicalHistoryLists(),
		'followUps' =>  \Helper::followupStatus(),
		'examTypes1' => \Helper::getExamTypeLists(1),
		'examTypes2' => \Helper::getExamTypeLists(2),
		'examTypes' => \Helper::getExamTypeLists(0),
	];
	
	return response()->json(['additionalData' => $additionalData],200,[],JSON_UNESCAPED_SLASHES);
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

Route::get('/file/{token}', function ($token, Request $request) {
   
    // 1️⃣ Decode the token
    $decoded = base64_decode(strtr($token, '-_', '+/'));
	$data = json_decode(gzuncompress($decoded), true);
	
	if(!empty($data['hasSigned']) && $data['hasSigned']){
		 
		if (! $request->hasValidSignature()) {
			abort(403, 'Unauthorized or expired link');
		}	
	}
	
    if (!$data || !isset($data['path'])) {
        abort(403, 'Invalid link');
    }
	  
    // 4️⃣ Check file exists
    if (!Storage::disk('public')->exists($data['path'])) {
        abort(404, 'File not found');
    }
 
    // 5️⃣ Serve the file
    return response()->file(storage_path('app/public/' . $data['path']));

})->name('file.serve');
