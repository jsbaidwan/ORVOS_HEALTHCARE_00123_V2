<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Patient;
use App\Models\Clinic;
use Mkinyua53\Orthanc\Facades\System;
use App\Services\MyOrthancClient;

class InsertDicomDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $study;

    public function __construct($study)
    { 
        $this->study = $study;
    }

    public function handle()
    {  
		sleep(10);
		
		$client = new MyOrthancClient();
        $study = $this->study;
		
		$studyId = $study['MainDicomTags']['StudyID'] ?: 
           ($study['MainDicomTags']['StudyInstanceUID'] ?? null);
		   
		$patient = Patient::where('study_id',$studyId)->first();
		if($patient){
			return false;
		}
		
		$deviceSerialNumber = $study['DeviceSerialNumber'] ?? null;  
		if(empty($deviceSerialNumber)){
			return false;
		}
		
		if(count($study['EyeAvailability']) == 0){
			return false;
		}
		
		$clinic = Clinic::where('device_id', $deviceSerialNumber)
		->where('is_dicom_enabled', 1)
		->first();

		if (!$clinic) {
			$clinic = Clinic::whereRaw('? REGEXP device_id', [$deviceSerialNumber])
			->where('is_dicom_enabled', 1)
			->first();
		}

		if (!$clinic) {
			return false;
		}
		 
		$studyDate = $study['MainDicomTags']['StudyDate'];
		$studyTime = $study['MainDicomTags']['StudyTime'] ?? '000000';

		// detect milliseconds automatically
		$format = str_contains($studyTime, '.') ? 'YmdHis.u' : 'YmdHis';

		$dateTimeString = $studyDate . $studyTime;

		$date = \Carbon\Carbon::createFromFormat($format, $dateTimeString);

		$input['dos'] = $date ? $date->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s');
		  
		$input['clinic_id'] = $clinic->id;
		$input['mr_number'] = $study['Patient']['PatientUID']  ?? null;  
		$input['l_eye'] = $study['EyeAvailability']['l_eye'] ?? 0;
		$input['r_eye'] = $study['EyeAvailability']['r_eye'] ?? 0; 
		
		$input['provider_id'] = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), 0, 7);
		$input['slug'] = \Helper::genSlug($input['provider_id'])['slug'];
		
		if($input['l_eye']){
			
			$leftEyeInstances = array_values(array_filter(
				$study['Instances'],
				fn($i) => strtolower($i['ImageLaterality'] ?? '') === 'l'
			));
		
			$uLeftEyeFiles = [];
			
			foreach($leftEyeInstances as $lInstance){
				 
				$imageData = $client->getRaw("/instances/{$lInstance['ID']}/preview");
				  
				$destinationPath = public_path('uploads/patients/' . $input['slug']);
				 
				if (!file_exists($destinationPath)) {
					mkdir($destinationPath, 0755, true);
				}
				$lEfilename = uniqid().'-'.$lInstance['ID'].'.png';
				 
				$path = $destinationPath.'/'.$lEfilename;
				file_put_contents($path, $imageData);
				
				$uLeftEyeFiles[] = $lEfilename;
			}
			$input['l_eye_images'] = json_encode($uLeftEyeFiles);
		}
		
		if($input['r_eye']){
			
			$rightEyeInstances = array_values(array_filter(
				$study['Instances'],
				fn($i) => strtolower($i['ImageLaterality'] ?? '') === 'r'
			));
			
			$uRightEyeFiles = [];
			foreach($rightEyeInstances as $rInstance){
				 
				$imageData = $client->getRaw("/instances/{$rInstance['ID']}/preview");
				$destinationPath = public_path('uploads/patients/' . $input['slug']);
				 
				if (!file_exists($destinationPath)) {
					mkdir($destinationPath, 0755, true);
				}
				$rEfilename = uniqid().'-'.$rInstance['ID'].'.png';
				 
				$path = $destinationPath.'/'.$rEfilename;
				file_put_contents($path, $imageData);
				
				$uRightEyeFiles[] = $rEfilename;
			}
			$input['r_eye_images'] = json_encode($uRightEyeFiles);
		}
		
		if(!empty($input['address'])){
			$getLatLng = \Helper::getLatLng($input['address'])['response'];
			$input['latitude'] = $getLatLng['latitude'];
			$input['longitude'] = $getLatLng['longitude'];
		}   
		 
		$patientName = $study['Tags']['0010,0010']['Value'] ?? $study['Patient']['MainDicomTags']['PatientName'] ?? null;
		 
		if (!empty($patientName)) {
			$nameParts = explode('^', $patientName);

			$lastName = array_shift($nameParts) ?? '';
			$firstName  = trim(implode(' ', $nameParts)) ?? '';
		}else{
			$firstName = '';
			$lastName = '';
		}  
		  
		$input['gender'] = in_array($g = strtolower($study['Patient']['MainDicomTags']['PatientSex'] ?? ''), ['m','male'])
		? 1
		: (in_array($g, ['f','female']) ? 2 : null);

		$dobRaw = $study['Patient']['MainDicomTags']['PatientBirthDate'] ?? null;
		$input['dob'] = (!empty($dobRaw) && strlen($dobRaw) === 8)
		? \Carbon\Carbon::createFromFormat('Ymd', $dobRaw)->format('Y-m-d')
		: null;
 
		$input['study_id'] = $studyId;
		$input['first_name'] = $firstName;
		$input['last_name'] = $lastName;
		$input['user_id'] = 0;
		$input['dicom_json'] = json_encode($study);
		$input['medical_history'] = json_encode([]);
		$input['p_code'] = \Helper::genPatientCode()['code'];
		try { 
			Patient::create($input);
		} catch (\Illuminate\Database\QueryException $e){
			logger()->warning("Duplicate study skipped: {$studyId}");
		}
		logger()->info("InsertDicomData:: Patient:- {$input['slug']} Study {$study['ID']} processed");
 
    }
}
