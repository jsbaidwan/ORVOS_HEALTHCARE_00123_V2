<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Api\LoginController;
  
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
	Route::get('reports/clinic-patient/export','App\Http\Controllers\Api\ReportController@clinicPatientExport');
	Route::get('reports/orvos-doctor-review/export','App\Http\Controllers\Api\ReportController@orvosDoctorReviewExport');
	Route::post('settings/clinic-additional', 'App\Http\Controllers\Api\SettingController@postAdditionalSettings');
	Route::get('settings/clinic-additional/{id}', 'App\Http\Controllers\Api\SettingController@getAdditionalSettings');
	Route::resource('pdf-templates', 'App\Http\Controllers\Api\PdfTemplateController');
	
	Route::post('/ckeditor/upload', function (Request $request) {

		if ($request->hasFile('file')) {

			$file = $request->file('file');

			$filename = time() . '_' . $file->getClientOriginalName();

			\Storage::disk('public')->putFileAs(
				'uploads/editor',
				$file,
				$filename
			);

			$url = \Storage::disk('public')->url('uploads/editor/' . $filename)
				 . '?convertToServerPath=' . $filename;

			return response()->json([
				'url' => $url
			]);
		}

		return response()->json([
			'error' => ['message' => 'Upload failed']
		], 400);
	})->name('ckeditor.upload');
	  
	Route::get('get-permissions', function(Request $request){
		return \Helper::permission();
	});
	
	Route::post('/impersonate', function(Request $request){
		 
		 return impersonateFunc($request);
	});
	
	Route::post('/stop-impersonate', function(Request $request){
		
		$request->merge([
			'stop' => true
		]);
		
		return impersonateFunc($request);
	});
	
	function impersonateFunc(Request $request)
	{
		$input = $request->all();
		if(empty($input['user_id'])){
			return json_encode(['status' => 422,'message' => 'The user_id is required.']);
		}
		
		$user = \Helper::getUserById($input['user_id'])['user'];
		
		$loginController = app(LoginController::class);
		$jsonUserData = $loginController->impersonateLoginResponse($request,\Auth::user());
		$jsonContent = $jsonUserData->getContent();
		
		$prevAuthData = json_decode($jsonContent,true);
		if (empty($input['stop'])) {
			$user['prev_auth_id'] = $prevAuthData['auth']['id'];
		}
	 
		return $loginController->impersonateLoginResponse($request,$user);
	}
	 
	
	Route::post('/get-pdf-temp-category', function (Request $request) {
		$input =  $request->all();
		if(!empty($input['pdf_temp_cat_id'])){
			$clinicId = !empty($input['clinic_id']) ? $input['clinic_id'] : NULL;
			$pdfTempCategory = \Helper::getPdfTempCategoryById($input['pdf_temp_cat_id'],$clinicId);
			if($pdfTempCategory['status'] == 200){
				return json_encode(['status' => 200,'pdfTempCategory' => $pdfTempCategory['pdfTempCategory']]);
			}
			
		}
		return json_encode(['status' => 422,'message' => 'The pdf_temp_cat_id is required.']);
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
		 
		if($input['module'] == 'pdfTemplate'){
			 
			$moduleData->update(['status' => 0]);
		}else{
			$moduleData->update(['is_archived' => 1]);
		}
		 
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
		
		if($input['module'] == 'pdfTemplate'){
			$moduleData->update(['status' => 1]);
		}else{
			$moduleData->update(['is_archived' => 0]);
		}
		
		$user = \Auth::user();
		\Log::save(
			$fModule.' Unarchived.',
			'The ' . $fModule . ' has been unarchived by ' . \Auth::user()->first_name . ' ' . \Auth::user()->last_name . '.',
			str_replace(' ', '', $fModule),
			$moduleData->id
		);
		return response()->json(['message' => \Helper::alertMsg('unarchive',$fModule,'success')['message']],200,[],JSON_UNESCAPED_SLASHES);
	});
	
	Route::post('/run-cron', function (Request $request) {
 
		if (!$request->clinic_id) {
			return response()->json([
				'message' => 'The clinic id field is required.'
			], 422);
		}
		
		if (!$request->cron_type) {
			return response()->json([
				'message' => 'The cron type field is required.'
			], 422);
		}

		$clinicId = $request->clinic_id;
		$clinic = \Helper::getClinicById($clinicId)['clinic'];

		$deviceIds = $clinic->device_ids;

		$runInBackground = $request->boolean('background', false);
  
		$cronType = $request->cron_type;

		if ($cronType === 'dicom:fetch') {

			if (!$deviceIds || count($deviceIds) === 0) {
				return response()->json([
					'message' => 'No device ids found for this clinic.'
				], 422);
			}

			/**
			 * Run in Background
			 */
			if ($runInBackground) {

				$artisan = base_path('artisan');

				foreach ($deviceIds as $deviceId) {

					$cmd = sprintf(
						'php "%s" %s --id=%s --type=%s',
						$artisan,
						escapeshellarg($cronType),
						escapeshellarg($deviceId),
						escapeshellarg('DeviceSerialNumber')
					);

					if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
						pclose(popen('start /B ' . $cmd, 'r'));
					} else {
						exec($cmd . ' > /dev/null 2>&1 &');
					}
				}

				return response()->json([
					'message' => 'DICOM Fetch Cron is now running in the background.',
					'background' => true
				], 200);
			}

			/**
			 * Run Synchronously
			 */
			set_time_limit(300);

			$outputs = [];

			foreach ($deviceIds as $deviceId) {

				\Artisan::call($cronType, [
					'id'   => $deviceId,
					'type' => 'DeviceSerialNumber'
				]);

				$outputs[] = [
					'device_id' => $deviceId,
					'output'    => \Artisan::output()
				];
			}

			return response()->json([
				'message'    => 'Cron executed successfully.',
				'output'     => $outputs,
				'background' => false
			], 200);
		}

		return response()->json([
			'message' => 'Invalid cron type.'
		], 422);
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
		'clinics' => \Helper::getClinics(false)['clinics'],
		'google_map_api_key' => \Helper::googleMapApiKey()['google_map_api_key'],
		'pdfTempCategories' => \Helper::getPdfTempCategories()['pdfTempCategories'],
		'tempBodyTags' => \Helper::tempBodyTags(),
		'screeningTypes' => \Helper::screeningTypes(),
		'tedDisease'  => \Helper::tedDisease(),
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
Route::post('patients/guest/store','App\Http\Controllers\Api\PatientController@guestPatientsStore')->name('patients.guest.store');

Route::get('patients/guest/verify/{id}',function(Request $request, $id){
	
	$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
	 
	$id = base64_decode(str_replace(['-', '_'], ['+', '/'], $id));
	$fullUrl = request()->fullUrlWithoutQuery(['app_url']);
	
	$requestFromUrl = \Request::create($fullUrl);
 
	if (! \URL::hasValidSignature($requestFromUrl)) {
		return response()->json([],404);
	}
	$clinic = \Helper::getClinicById($id)['clinic'];
	 	
	if(!$clinic){
		return response()->json([],404);
	}
	if($clinic->status == 0){
		return response()->json(404);
	}
	if (!empty($clinic->additionalSetting)) {
		$data = json_decode($clinic->additionalSetting->data, true);
   
		$setting = $data['allow_add_patient_without_login'] ?? null;
	
		if ($setting === false) {
			return response()->json([],404);
		}
	}else{
		return response()->json([],404);
	}
	return response()->json([],200);
	 
})->name('patients.guest.verify');
 
Route::get('/file/{token}', function ($token, Request $request) {

    try {
        $data = \Crypt::decrypt($token);
        
    } catch (\Exception $e) {
        abort(403, 'Invalid token');
    }
 
    if (!empty($data['hasSigned']) && $data['hasSigned']) {
 
        if (! $request->hasValidSignatureWhileIgnoring(['v'])) {
            abort(403, 'Unauthorized or expired link');
        }
    }

    if (!Storage::disk('public')->exists($data['path'])) {
        abort(404, 'File not found');
    }

   return response()->file(
		storage_path('app/public/' . $data['path']),
		[
			'Cache-Control' => 'private, no-store, no-cache, must-revalidate, max-age=0',
			'Pragma' => 'no-cache',
			'Expires' => '0',
		]
	);
})->name('file.serve');
