<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Mpdf\Mpdf;
use App\Notifications\ClinicPatientReportMail;
use App\Jobs\SendClinicPatientReportJob;
use App\Jobs\SendFaxReportToClinicJob;
use App\Jobs\SendDicomDataJob;
use App\Exports\PatientsExport;
  
class PatientController extends Controller
{ 
	public function index(Request $request)
	{	
		$haveAccess = \Helper::permission(2,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		 
		$patients = \Helper::getPatients(false,$input)['patients']; 
		if(!empty($input['export_excel'])){
            return ['patients' => $patients];
        }
		return response()->json(['patients' => $patients], 200);
		 
	}
	
	public function store(Request $request)
    {
        $input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
        if(empty($input['guest'])){
            $haveAccess = \Helper::permission(2,'create');
            if(!$haveAccess){
                return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
            }
        }
		  
         
		// Define validation rules for all fields
        $rules = Patient::$rules;
		$messages = Patient::$messages;
        
		if(!empty($input['address'])){
			$getLatLng = \Helper::getLatLng($input['address'])['response'];
			$input['latitude'] = $getLatLng['latitude'];
			$input['longitude'] = $getLatLng['longitude'];
		}   
		 
		 
		if (!empty($input['l_eye_images2'])) {
			$input['l_eye_images'] = $input['l_eye_images2'];
		}
		
		if (!empty($input['r_eye_images2'])) {
			$input['r_eye_images'] = $input['r_eye_images2'];
		}
		 
        
        // Set user ID from authenticated user
        if(empty($input['guest'])){
             $input['user_id'] = auth()->id();
        }else{
            $input['user_id'] = 0;
        }
		$settingsData = [];
        $clinicId = $input['clinic_id']; 
        // $settings = AdditionalSetting::where('clinic_id', $clinicId)->first();
        // $settingsData = $settings ? json_decode($settings->data, true) : [];

		$clinic = \Helper::getClinicById($clinicId)['clinic'];
		if($clinic){
			if($clinic->is_dicom_enabled){
				unset($rules['medical_condition_id']);
			}
		}
        // dd($settingsData);
        if (empty($settingsData['patient_ins_billing_fields']) || $settingsData['patient_ins_billing_fields'] == 'off' ) {
        //  dd('asasdas');
            unset($rules['p_insurance_name']);
            unset($rules['p_insurance_group_no']);
            unset($rules['p_insurance_member_no']);
            unset($rules['phone']);
        }
		
		if (empty($settingsData['emailToggle']) || $settingsData['emailToggle'] == 'off' ) {
			 unset($rules['email']);
		}

        if (empty($settingsData['patient_address']) || $settingsData['patient_address'] == 'off') {
            unset($rules['address']);
        }

        // Validate input
        $validate = Validator::make($input, $rules,$messages);
        
        if ($validate->fails()) {
			return response()->json(['message' => $validator->errors()], 422);
        }
		 
		$input['slug'] = \Helper::genSlug(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), 0, 7))['slug'];
        if (!empty($input['l_eye_images'])) {
			$lEyeImgs = $input['l_eye_images'];
			$uLeftEyeFiles = [];

			foreach ($lEyeImgs as $lFile) {
				if ($lFile instanceof \Illuminate\Http\UploadedFile) {

					// Generate unique filename
					$lEfilename = time() . '_' . uniqid() . '.' . $lFile->getClientOriginalExtension();

					// Define path inside storage/app/public
					$path = 'uploads/patients/' . $input['slug'];

					// Store file
					$lFile->storeAs('public/' . $path, $lEfilename);

					// Save only relative path (important)
					$uLeftEyeFiles[] = $lEfilename;
				}
			}

			// Store as JSON
			$input['l_eye_images'] = json_encode($uLeftEyeFiles);
		}
		
		if (!empty($input['r_eye_images'])) {
			$rEyeImgs = $input['r_eye_images'];
			$uRightEyeFiles = [];

			foreach ($rEyeImgs as $rFile) {
				if ($rFile instanceof \Illuminate\Http\UploadedFile) {

					// Generate unique filename
					$rEfilename = time() . '_' . uniqid() . '.' . $rFile->getClientOriginalExtension();

					// Define storage path
					$path = 'uploads/patients/' . $input['slug'];

					// Store file in storage/app/public
					$rFile->storeAs('public/' . $path, $rEfilename);

					// Save relative path
					$uRightEyeFiles[] = $rEfilename;
				}
			}

			// Store JSON
			$input['r_eye_images'] = json_encode($uRightEyeFiles);
		}
		 
        $input['medical_history'] = !empty($input['medical_history']) ? json_encode($input['medical_history']) : json_encode([]);
		$input['p_code'] = \Helper::genPatientCode()['code'];
			
		$input['l_eye'] = !empty($input['l_eye']) ? $input['l_eye'] : 0;
		$input['r_eye'] = !empty($input['r_eye']) ? $input['r_eye'] : 0;
		
		if(empty($input['l_eye'])){
			unset($input['l_eye_images']);
		}
		if(empty($input['r_eye'])){
			unset($input['r_eye_images']);
			 
		}
		
		$input['dob'] = \Helper::changeDateFormat($input['dob'])['date'];
		$input['dos'] = \Helper::changeDateFormat(now()->format('m-d-Y'),'Y-m-d H:i:s')['date'];
        // Create new Patient record
        $patient = Patient::create($input);
		
		\Log::save(
			'Patient Created.',
			'The Patient has been created by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'Patient',
			$patient->id
		);
		  
		return response()->json(['message' => 'Patient created successfully.'], 200);
		 
		 
    }
	
	public function update(Request $request, $id)
     { 
		$haveAccess = \Helper::permission(2,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$patient = Patient::find($id); 
		if(!$patient){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		 
        $clinicId = $input['clinic_id']; 
		// Validation rules
		$rules = Patient::$rules;
		$messages = Patient::$messages;
		//$rules['provider_id'] .= ',provider_id,'.$id;
		 
		if(!empty($input['address'])){
			$getLatLng = \Helper::getLatLng($input['address'])['response'];
			$input['latitude'] = $getLatLng['latitude'];
			$input['longitude'] = $getLatLng['longitude'];
		}
        //$rules['email'] .= ',email,' . $id;
		$settingsData = [];
        // $settings = AdditionalSetting::where('clinic_id', $clinicId)->first();
        // $settingsData = $settings ? json_decode($settings->data, true) : [];

        if (empty($settingsData['patient_ins_billing_fields'])  || $settingsData['patient_ins_billing_fields'] == 'off' ) {

            unset($rules['p_insurance_name']);
            unset($rules['p_insurance_group_no']);
            unset($rules['p_insurance_member_no']);
            unset($rules['phone']);
        }

        if (empty($settingsData['patient_address']) || $settingsData['patient_address'] == 'off') {
            unset($rules['address']);
        }
		if (empty($settingsData['emailToggle']) || $settingsData['emailToggle'] == 'off' ) {
			 unset($rules['email']);
		}
		
		$clinic = \Helper::getClinicById($clinicId)['clinic'];
		if($clinic){
			if($clinic->is_dicom_enabled){
				unset($rules['medical_condition_id']);
			}
		}
		
		if($patient->diagnosis_status == 1){
			$rules['remark_at'] = 'required';
		}

		$validator = Validator::make($input, $rules,$messages);
     
		if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()], 422);
		}
		  
		if (!empty($input['removed_leftEyePreview_files'])) {

			foreach ($input['removed_leftEyePreview_files'] as $lImgFile) {

				// Delete from storage
				if (!empty($lImgFile)) {
					
					$path = 'uploads/patients/' . $patient['slug'];
					// File path inside storage
					$filePath = $path .'/'. $lImgFile;
					
					// Delete if exists
					if (Storage::disk('public')->exists($filePath)) {
						Storage::disk('public')->delete($filePath); 
					}
					 
				}

				// Remove from DB JSON
				if ($patient->l_eye_images) {

					$lExistingFiles = json_decode($patient->l_eye_images, true);

					// Filter out removed file
					$lExistingFiles = array_filter($lExistingFiles, function ($file) use ($lImgFile) {
						return $file !== $lImgFile;
					});

					// Reindex + save
					$patient->l_eye_images = json_encode(array_values($lExistingFiles));
					$patient->save();
				}
			}
		}
		  	
		
		if (!empty($input['removed_rightEyePreview_files']) && $patient->r_eye_images) {

			$rExistingFiles = json_decode($patient->r_eye_images, true);

			foreach ($input['removed_rightEyePreview_files'] as $rImgFile) {

				if ($rImgFile) {
					// Delete from storage
					$path = 'uploads/patients/' . $patient['slug'];
					// File path inside storage
					$filePath = $path .'/'. $rImgFile;

					// Delete if exists
					if (Storage::disk('public')->exists($filePath)) {
						Storage::disk('public')->delete($filePath); 
					}
						 
					// Remove from array
					$rExistingFiles = array_filter($rExistingFiles, fn($file) => $file !== $rImgFile);
				}
			}

			// Reindex + save once
			$patient->r_eye_images = json_encode(array_values($rExistingFiles));
			$patient->save();
		}
		
		$uLeftEyeFiles = json_decode($patient->l_eye_images, true);
		$uRightEyeFiles = json_decode($patient->r_eye_images, true);
		
		$input['medical_history'] = !empty($input['medical_history']) ? json_encode($input['medical_history']) : json_encode([]);
		$input['l_eye'] = !empty($input['l_eye']) ? $input['l_eye'] : 0;
		$input['r_eye'] = !empty($input['r_eye']) ? $input['r_eye'] : 0;
		
		if (!empty($input['l_eye_images'])) {
			$lEyeImgs = $input['l_eye_images']; 
			
			foreach ($lEyeImgs as $lFile) {

				if ($lFile instanceof \Illuminate\Http\UploadedFile) {

					// Generate unique filename
					$lEfilename = time() . '_' . uniqid() . '.' . $lFile->getClientOriginalExtension();

					// Define path
					$path = 'uploads/patients/' . $patient['slug'];

					// Store file in storage/app/public
					$lFile->storeAs('public/' . $path, $lEfilename);

					// Save relative path
					$uLeftEyeFiles[] = $lEfilename;
				}
			}

			// Store JSON
			$input['l_eye_images'] = json_encode($uLeftEyeFiles);
		}
		
		if (!empty($input['r_eye_images'])) {
			$rEyeImgs = $input['r_eye_images'];
			 
			foreach ($rEyeImgs as $rFile) {
				if ($rFile instanceof \Illuminate\Http\UploadedFile) {

					// Generate unique filename
					$rEfilename = time() . '_' . uniqid() . '.' . $rFile->getClientOriginalExtension();

					// Define path
					$path = 'uploads/patients/' . $patient['slug'];

					// Store file
					$rFile->storeAs('public/' . $path, $rEfilename);

					// Save relative path
					$uRightEyeFiles[] = $rEfilename;
				}
			}

			// Store JSON
			$input['r_eye_images'] = json_encode($uRightEyeFiles);
		}
		  
		if(empty($input['l_eye'])){
			 
           if ($patient->l_eye_images) { 
				$lExistingFiles = json_decode($patient->l_eye_images, true);

				foreach ($lExistingFiles as $file) {
					if (!empty($file)) {

						$path = 'uploads/patients/' . $patient['slug'];
						// File path inside storage
						$filePath = $path .'/'. $file;

						// Delete if exists
						if (Storage::disk('public')->exists($filePath)) {
							Storage::disk('public')->delete($filePath); 
						}
					}
				}

				// Reset input
				$input['l_eye_images'] = [];
			}
		}
		
		if(empty($input['r_eye'])){
			// unlink Existing files
            if ($patient->r_eye_images) { 
				$rExistingFiles = json_decode($patient->r_eye_images, true);

				foreach ($rExistingFiles as $file) {
					if (!empty($file)) {

						// Path inside storage
						$path = 'uploads/patients/' . $patient['slug'];
						// File path inside storage
						$filePath = $path .'/'. $file;

						// Delete file
						if (Storage::disk('public')->exists($filePath)) {
							Storage::disk('public')->delete($filePath); 
						}
					}
				}

				// Reset input
				$input['r_eye_images'] = [];
			}
		}
		
		if(!empty($input['created_at'])){
			$input['created_at'] = \Helper::changeDateFormat($input['created_at'],'Y-m-d H:i:s')['date'];
			
		}
		
        $input['dob'] = \Helper::changeDateFormat($input['dob'],'Y-m-d',false)['date'];
		
		if($patient->diagnosis_status == 1){
			if(!empty($input['remark_at'])){
				$input['remark_at'] = \Helper::changeDateFormat($input['remark_at'],'Y-m-d H:i:s')['date'];
				
			}
			if(!empty($input['dos'])){
				$input['dos'] = \Helper::changeDateFormat($input['dos'],'Y-m-d H:i:s')['date'];
			}
		}
		 
		// Update the patient's data
		$patient->update($input);
		
		\Log::save(
			'Patient Updated.',
			'The Patient has been updated by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'Patient',
			$patient->id
		);
      
		return response()->json(['message' => 'Patient updated successfully.'], 200);
		  
     }
	
	public function edit($id)
    {  
		$haveAccess = \Helper::permission(2,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$patient = \Helper::getPatientById($id)['patient'];
		if(!$patient){
			return response()->json(['message' => \Helper::alertMsg('edit','Patient','error')['message']], 404);
		}
		return response()->json(['patient' => $patient], 200);
    }
	
	public function show($id)
	{
		$haveAccess = \Helper::permission(2,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$patient = \Helper::getPatientById($id)['patient'];
		if(!$patient){
			return response()->json(['message' => \Helper::alertMsg('edit','Patient','error')['message']], 404);
		}
		return response()->json(['patient' => $patient], 200);
	}
	
	public function destroy($id)
	{ 
		$haveAccess = \Helper::permission(2,'delete');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$patient = \Helper::getPatientById($id)['patient'];
		if(!$patient){
			return response()->json(['message' => 'We couldn’t find the patient you’re looking for.'], 404);
		}
		 
		$patient->delete();
		\Log::save(
			'Patient Deleted.',
			'The Patient has been deleted by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'Patient', 
			$patient->id
		);
		return response()->json(['message' => 'Patient deleted successfully.'], 200);
		
	}
	
	 /**
     * Remark the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */

	public function remark(Request $request, $id)
    {  
		 // Get all input data
        $input = $request->all();
		
		if(empty($input['remark_by'])){
			
			// Check permission
			$haveAccess = \Helper::permission(5, 'write');
			if (!$haveAccess) {
				return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
			}
		}
          
		// Base validation rules
		$rules = [
			//'remark' => 'required|string',
			'exam_data' => 'required|array',
			'follow_up' => 'required',
		];
		
		// Create validator instance
		$validator = \Validator::make($request->all(), $rules);
 
		// Custom validation: ensure at least one exam type selected from left or right eye
		$validator->after(function ($validator) use ($input) {
			 
			$leftSelected = isset($input['exam_data']['leftEye']) &&
				collect($input['exam_data']['leftEye'])->contains(fn($e) => !empty($e['exam_type']));

			$rightSelected = isset($input['exam_data']['rightEye']) &&
				collect($input['exam_data']['rightEye'])->contains(fn($e) => !empty($e['exam_type']));
 
			if(isset($input['exam_data']['leftEye'])){
				if(!$leftSelected){
					
					$validator->errors()->add('exam_data', 'Please select at least one exam type for Left eyes.');
				}
				
			}else if(isset($input['exam_data']['rightEye'])){
				if(!$rightSelected){
					$validator->errors()->add('exam_data', 'Please select at least one exam type for Right eyes.');
				}
				
			}else if (!$leftSelected || !$rightSelected) {
				$validator->errors()->add('exam_data', 'Please select at least one exam type for both Left and Right eyes.');
			}
		});

 
		if ($validator->fails()) {
			return response()->json([
				'message' => 'Validation failed.',
				'errors' => $validator->errors()
			], 422);
		}
 
		// Validate and automatically redirect back if fails
		//$validatedData = $validator->validate();
		  
		// Find patient
		$patient = Patient::find($id);
		if (!$patient) {
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
 
		$data = [
			'remark' => $request->remark,
			'exam_data' => $request->exam_data,
		];
 
		// Update patient record
		$patient->update([
			'diagnosis_status' => 1,
			'remark_status' => 1,
			'remark_by' => $request->remark_by ?? auth()->id(),
			'remark_result' => json_encode($data),
			'remark_at' => now(),
			'follow_up' => $request->follow_up,
		]);

		$filters['diagnosis_status'] = 0;
		$patients = \Helper::getPatients(false,$filters)['patients'];
		  
		// Get the last patient ID based on 'id'
		$lastPatientId = $patients->sortByDesc('id')->first()->id ?? null;
		 
		$patient = Patient::find($id);
		if(!empty($patient->clinic->is_patient_report_email_enabled)){
			// Dispatch the job to the queue
			SendClinicPatientReportJob::dispatch($patient)->onQueue('send-clinic-patient-report');
		}
		if(!empty($patient->clinic->is_fax_enabled)){
			$patient->update(['fax_status' => 1]);
			SendFaxReportToClinicJob::dispatch($patient)->onQueue('send-fax-report-to-clinic');
		}
		
		if(!empty($patient->clinic->is_stow_enabled)){
			$patient->update(['is_dicom_file_send' => 1]);
			SendDicomDataJob::dispatch($patient)->onQueue('send-dicom-data');
		}
		
		\Log::save(
			'Patient Diagnosed.',
			'The Patient '. $patient['first_name']  .' '. $patient['last_name']  .' ('. $patient['p_code'] .') has been diagnosed by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'Patient', 
			$patient->id
		);
		 
		if(\Auth::user() && $lastPatientId){
			$appUrl = !empty($input['app_url']) ?? url('/');
			return response()->json(['message' => 'The Patient has been diagnosed successfully.','redirect_url' =>  '/patients/view/'.$lastPatientId], 200);
			 
		}
		
		return response()->json(['message' => 'The Patient has been diagnosed successfully..'], 200);
		 
    }
	
	 /**
     * Update Diagnosis Status the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
	 
	public function updateDiagnosisStatus(Request $request, $id)
    {
		$input = $request->all(); 
		// Find the patient
        $patient = Patient::find($id);
        if (!$patient) {
           return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
        }
		
		// Update the existing record
		$patient->update([
			'diagnosis_status' => $input['diagnosis_status'],
			 
		]);
		Toastr::success('Diagnosis Status updated successfully.', 'Success');  
        return redirect()->back()->with('success', 'Diagnosis Status updated successfully.');
	}
	
	
	 /** View page of Guest Patient Diagnosis.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
	 
	public function guestPatientsRemarkView(Request $request, $id)
    {  
		$input = $request->all();
		$id = base64_decode(str_replace(['-', '_'], ['+', '/'], $id));
		$fullUrl = url()->full();
		$requestFromUrl = \Request::create($fullUrl);
		 
		// ✅ Ensure the URL signature is valid
		if (!\URL::hasValidSignature($requestFromUrl)) {
			return response()->json(['message' => \Helper::permissionMsg()['message']], 403);
			 
		}

		// Check if the URL is valid
		if (!$input['signature']) {
			return response()->json(['message' => \Helper::permissionMsg()['message']], 403);
		}
 
		$patient = Patient::find($id);
        if (!$patient) {
            return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
        }
		if($patient->remark_status == 1){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 403);
		}
		
		$newReq = new Request;
		$input['orvDoctor'] = json_decode(\Crypt::decryptString($input['orvDoctor']),true);
		if($input['orvDoctor']['role_id'] != 2 || $input['orvDoctor']['status'] == 0){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 403);
		}
        $nRequest = $newReq->replace($input, $id);
		return $this->show($nRequest,$id);
		 
	}
	
	
	 /** Create of Guest Patient Diagnosis.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
	 
	public function guestPatientsRemarkStore(Request $request, $id)
    {
		$input = $request->all();
		// Check if the URL is valid
		$newReq = new Request;
		$nRequest = $newReq->replace($input, $id);
		$this->remark($nRequest,$id);
		return response()->make("
			<!DOCTYPE html>
			<html>
			<head>
				<title>Success</title>
				<style>
					body { font-family: Arial, sans-serif; background: #f8fafc; text-align: center; padding: 100px; }
					.box { display: inline-block; background: #e6ffed; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
					h1 { color: #16a34a; }
					p { font-size: 18px; color: #333; }
				</style>
			</head>
			<body>
				<div class='box'>
					<h1>✅ Success</h1>
					<p>Diagnosis completed successfully</p>
				</div>
			</body>
			</html>
		", 200);

	}

    public function exportPatients(Request $request)
    {
        $input = $request->all();
         
        $input['export_excel'] = true;
        $newRqst = new Request;
        $newRqst->replace($input);
        $patients = self::index($newRqst)['patients'];
          
        // Check if there are any patients to export
        if ($patients->isEmpty()) {
            return response()->json([
				'message' => 'No data available for export.'
			], 422);
        }
		
		if(!isset($input['diagnosis_status'])){
			return response()->json([
				'message' => 'The diagnosis status is required.'
			], 422);
		}
    
        // Export the data using the PatientsExport class
		$pStatus = \Helper::getPatientDiagnosisStatusById($input['diagnosis_status'])['pStatus']['name'] ?? '';

		$fileName = 'patients_' . ($pStatus ?: 'all') . '.xlsx';

		// Generate Excel file here
		$path = 'excels/patients/' . $fileName;

		\Excel::store(
			new PatientsExport($patients),
			$path,
			'public'
		);
		
		return response()->json([
			'file_name' => $fileName,
			'download_url' => asset('storage/' . $path),
			'message' => 'Patients list exported successfully.'
		], 200); 
    }
	 

    public function guestPatientsCreate(Request $request, $id)
    { 
		$input = $request->all();
        $id = base64_decode(str_replace(['-', '_'], ['+', '/'], $id));
		$fullUrl = url()->full();
		$requestFromUrl = \Request::create($fullUrl);
		 
		if (!\URL::hasValidSignature($requestFromUrl)) {
			return response()->json(['message' => \Helper::permissionMsg()['message']], 403);
		}
        $clinic = \Helper::getClinicById($id)['clinic'];
        if(!$clinic){
           return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
        }
        if($clinic->status == 0){
           return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
        }
        if (!empty($clinic->additionalSetting)) {
            $data = json_decode($clinic->additionalSetting->data, true);
       
            $setting = $data['allow_add_patient_without_login'] ?? null;
        
            if ($setting !== "on") {
               return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
            }
        }else{
            return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
        }
    

        
        return view('superadmin/patients/create', compact('clinic'));
	}

    public function guestPatientsStore(Request $request)
    {
        $input = $request->all();
        $input['guest'] = true;
        $input['ajaxRqt'] = true;
        $newRqst = new Request($input);
        $newRqst->replace($input);
         
        return $this->store($newRqst);
       
    }
	
	public function patientPdf(Request $request, $id)
	{
		$patient = Patient::with('remarkBy','clinic')->findOrFail($id);
		if(!$patient){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		 
		
		// Render Blade view to HTML
		$hasPdfTempByCliniId = \Helper::getPdfTemplateByClinicId($patient->clinic_id,1,$patient);
		
		$pdfTemplate = NULL;
		if($hasPdfTempByCliniId['status'] == true){
			$pdfTemplate = $hasPdfTempByCliniId['pdfTemplate'];
		}
		 
		$html = \View::make('pdf.patient', [
			'patient' => $patient,
			'hasPdfTempByCliniId' => $hasPdfTempByCliniId['status'],
			'pdfTemplate' => $pdfTemplate,
			
		])->render();

		// Create mPDF instance
		$mpdf = new Mpdf();
		
		$mpdf->img_dpi = 96;
		$mpdf->dpi = 96;
		$mpdf->curlAllowUnsafeSslRequests = true;
		
		if(!empty($request->hasPassword)){
			// Set PDF Password
			$userPassword  = $patient->clinic->code ?? 'orvosPass123!';   // password to OPEN the PDF
			$ownerPassword = $userPassword; // password to control permissions
		 
			$mpdf->SetProtection(
				['copy', 'print'], // allowed permissions
				$userPassword,     // user password
				$ownerPassword     // owner password
			);
		}

		// Write HTML
		$mpdf->WriteHTML($html);

		// Output as download
		$filename = 'patient_' . $patient->p_code . '_' . $patient->first_name . '_' . $patient->last_name . '_' . $patient->mr_number . '.pdf';

		/* Replace spaces with underscore */
		$filename = str_replace(' ', '_', $filename);

		/* Remove special characters */
		$filename = preg_replace('/[^A-Za-z0-9_\-.]/', '', $filename);

		$pdfContent = $mpdf->Output($filename, 'S');
		if(!empty($request->return_back)){
			return  [
				'message'  => 'PDF Generated Successfully',
				'pdfContent'  => $pdfContent,
				'fileName' => $filename,
				 
			];
		}

		if($patient->is_pdf_report_downloaded == 1){
			$patient->update(['is_pdf_report_downloaded' => 2,'pdf_report_downloaded_by' => \Auth::user()->id ?? 0]);
		}
		
		$tempDir = storage_path('app/pdf-temp');

		if (!file_exists($tempDir)) {
			mkdir($tempDir, 0777, true);
		}

		/*
		|--------------------------------------------------------------------------
		| Same base filename for input/output
		|--------------------------------------------------------------------------
		*/

		$baseName   = pathinfo($filename, PATHINFO_FILENAME);

		$inputFile  = $tempDir . '/' . $baseName . '.pdf';
		$outputFile = $tempDir . '/' . $baseName . '_compressed.pdf';

		/*
		|--------------------------------------------------------------------------
		| Save mPDF binary string as input file
		|--------------------------------------------------------------------------
		*/

		file_put_contents($inputFile, $pdfContent);

		/*
		|--------------------------------------------------------------------------
		| Ghostscript Compress
		|--------------------------------------------------------------------------
		*/

		\Helper::ghostScriptPdfCompress($inputFile,$outputFile);
		
		/*
		|--------------------------------------------------------------------------
		| Use compressed if success else original
		|--------------------------------------------------------------------------
		*/

		$finalFile = (file_exists($outputFile) && filesize($outputFile) > 0)
			? $outputFile
			: $inputFile;

		$finalPdf = file_get_contents($finalFile);

		/*
		|--------------------------------------------------------------------------
		| Delete temp files
		|--------------------------------------------------------------------------
		*/

		@unlink($inputFile);
		@unlink($outputFile);

		/*
		|--------------------------------------------------------------------------
		| Return PDF
		|--------------------------------------------------------------------------
		*/
		 
		return response()->json([
			'message'  =>  'PDf Downloaded',
			'pdf'      => base64_encode($finalPdf),
			'report_download_status_data' => $patient['report_download_status_data'] ?? [],
			'fileName' => $filename
		], 200);
	}
	 
	public function sendPdf(Request $request)
	{
		$input = $request->all();
		if(empty($input['patient_id'])){
			return response()->json(['message' => 'This Patient id is required.'], 422); 
		}
		   
		$patient = Patient::find($input['patient_id']);
		if(!$patient){
			return response()->json(['message' => 'PDF Failed','class' => 'text-danger'], 422);
		} 
		// Dispatch the job to the queue
		$patient->clinic->email = $patient->clinic->poc_email ?? NULL; 
		$patient->clinic->email = 'sandeep.intnxt@gmail.com'; 
		$patient->clinic->notify(new ClinicPatientReportMail($patient));
  
		$patient = Patient::find($input['patient_id']);
		$status = $patient->is_report_sent ? 'PDF Sent':'PDF Failed';
		$class = $patient->is_report_sent ? 'text-success':'text-danger';
		return response()->json(['message' => $status,'class' => $class,'report_sent_status' => $patient['report_sent_status'] ?? []], 200);
	 
	}
	
	public function sendFax(Request $request)
	{
		$input = $request->all();
		
		if(empty($input['patient_id'])){
			return response()->json(['message' => 'This Patient id is required.'], 422); 
		}
		
		$patient = Patient::find($input['patient_id']);
		if(!$patient){
			return response()->json(['message' => 'This Patient not exist in your records.'], 422); 
		}
		if(empty($patient->clinic->fax_number)){  
		return response()->json(['message' => 'The fax number for the '.$patient->clinic->name.' is not available.Please add a fax number to the clinic'], 422);
			  
		}
		$patient->clinic->email = $patient->clinic->poc_email ?? NULL; 
		 
		$sendFax = new SendFaxReportToClinicJob($patient);
		$response = $sendFax->handle();
		
		$class = $response['fax_status'] == 1
		? 'text-warning'
		: ($response['fax_status'] == 2
			? 'text-success'
			: 'text-danger');

		$status = $response['fax_status'] == 1
		? 'Fax Sending'
		: ($response['fax_status'] == 2
			? 'Fax Delivered'
			: 'Fax Failed');
			
		$patient = Patient::find($input['patient_id']);	
		
		$errorMsg = NULL;
		if(!empty($patient->fax_json)){
			$faxArr = json_decode($patient->fax_json,true);
			$errorMsg = $faxArr['message'] ?? NULL;
		}
		return ['status_code' => $response['fax_status'],'err_msg' => $errorMsg,'fax_status_data' => $patient['fax_status_data']]; 
		
	}
	
	public function sendDicom(Request $request)
	{
		$input = $request->all();
		if(empty($input['patient_id'])){
			return response()->json(['message' => 'This Patient id is required.'], 422); 
		}
		
		$patient = Patient::find($input['patient_id']);
		if(!$patient){
			return response()->json(['message' => 'This Patient not exist in your records.'], 422);  
		}
		
		$sendDicom = new SendDicomDataJob($patient);
		$response = $sendDicom->handle();
		 
		$response['dicom_file_status_data'] = $patient['dicom_file_status_data']; 
		return json_encode($response);
		 
	}
	
	public function clone(Request $request)
	{
		$input = $request->all();
		if(empty($input['patient_id'])){
			return response()->json(['message' => 'This Patient id is required.'], 422); 
		}
		
		$patientId = $input['patient_id'];
		$patient = \Helper::getPatientById($patientId)['patient'];
		if(!$patient){
			return response()->json(['message' => 'This Patient not exist in your records.'], 422); 
		}
		 
		/* clone patient */
		$newPatient = $patient->replicate();

		/* generate new slug */
		$randId = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), 0, 7);

		$newPatient->p_code =\Helper::genPatientCode()['code'];
		 
		$newPatient->slug = \Helper::genSlug($randId)['slug'];
		

		/* reset required fields */
		$newPatient->remark_status = 0;
		$newPatient->diagnosis_status = 0;
 
		$newPatient->remark_by = null;
		$newPatient->remark_result = null;
		$newPatient->remark_at = null;

		$newPatient->follow_up = 0;

		$newPatient->is_pdf_report_downloaded = 1;
		$newPatient->pdf_report_downloaded_by = null;

		$newPatient->is_report_sent = 0;
		$newPatient->report_sent_by = null;
		$newPatient->report_sent_at = null;

		$newPatient->fax_job_id = null;
		$newPatient->fax_status = 0;
		$newPatient->fax_sent_by = null;
		$newPatient->fax_sent_at = null;
		$newPatient->fax_json = null;
		
		$newPatient->study_id = null;
		$newPatient->dicom_json = null;
		 
		$newDestinationPath = storage_path('app/public/uploads/patients/' . $newPatient->slug);

		if (!file_exists($newDestinationPath)) {
			mkdir($newDestinationPath, 0755, true);
		}

		if (!empty($patient->slug)) {
			$destinationPath = storage_path('app/public/uploads/patients/' . $patient->slug);

			if (file_exists($destinationPath)) {
				\File::copyDirectory($destinationPath, $newDestinationPath);
			}
		}
		 
		/* save as new record */
		$newPatient->save();
		return response()->json(['message' => 'Patient record cloned successfully.'], 200);
	}
	
}