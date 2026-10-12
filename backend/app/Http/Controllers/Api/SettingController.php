<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;
use App\Models\AdditionalSetting;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
  
class SettingController extends Controller
{ 
  
	public function getAdditionalSettings(Request $request)
	{
		$input = $request->filled('data')
			? json_decode($request->input('data'), true)
			: $request->all();

		if (empty($input['clinic_id'])) {
			return response()->json([
				'additionalSettings' => null,
				'message' => 'No clinic ID provided.'
			], 422);
		}

		$clinicId = $input['clinic_id'];
		$appUrl = $request->app_url;
		$signedUrl = \Helper::genSignedUrl(
			$clinicId,
			[],
			'patients.guest.verify',
			$appUrl,
			false,
			true
		)['signedRoute'];

		$settings = AdditionalSetting::where('clinic_id', $clinicId)->first();
		$clinic   = \Helper::getClinicById($clinicId)['clinic'] ?? null;

		$data = [];

		if (!empty($settings) && !empty($settings->data)) {
			$data = json_decode($settings->data, true) ?? [];
		}

		$data['clinic_url'] = $signedUrl;

		if ($clinic) {
			$data['is_dicom_enabled'] = $clinic->is_dicom_enabled;
			$data['clinic_code'] = $clinic->code;
		}

		if (empty($settings) || empty($settings->data)) {
			return response()->json([
				'additionalSettings' => $data,
				'message' => 'No settings found for clinic ID: ' . $clinicId
			], 200);
		}

		return response()->json([
			'additionalSettings' => $data
		], 200);
	}
	
	public function postAdditionalSettings(Request $request)
	{	 
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$rules = AdditionalSetting::$rules;
  
        $validate = Validator::make($input,$rules);
        if($validate->fails()){
            
            return redirect()->back()->withErrors($validate)->withInput();
        }
		
		$hasTedAppAccess = $input['ted_app_cred']['has_ted_app_access'] ?? false;
		if($hasTedAppAccess == false){
			$input['ted_app_cred']['app_clinic_code'] = NULL;
			$input['ted_app_cred']['app_clinic_password'] = NULL;
		}
	 
		if ($hasTedAppAccess == true) {
			$validate = Validator::make($input, [
				'ted_app_cred.app_clinic_password' => 'required|string|min:8',
			]);

			if ($validate->fails()) {
				return response()->json([
					'errors' => $validate->errors(),
					'message' => $validate->errors()->first(),
				], 422);
			}
		}else{
			$input['ted_app_cred']['has_ted_app_access']  = false;
		}
		
		$clinic = \Helper::getClinicById($request->clinic_id)['clinic'];
		if($clinic){
			$input['ted_app_cred']['app_clinic_code'] = $clinic->code;
		 
		}
        
       
        $setting = AdditionalSetting::updateOrCreate(
            ['clinic_id' => $request->clinic_id],
            [
                'data' => json_encode($input),
                'user_id' => \Auth::id(),
            ]
        );
         
		\Log::save(
			'Settings Updated Successfully',
			'The Settings has been created by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'User',
			\Auth::id()
		);
		  
		return response()->json(['setting' => $setting,'message' => 'Setting created successfully.'], 200);
	}
	 
	  
}