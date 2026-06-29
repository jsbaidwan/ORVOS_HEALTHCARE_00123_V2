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

class UpdateDicomDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public $study;

    public function __construct($study)
    { 
        $this->study = $study;
    }

    public function handle()
    {  
		$client = new MyOrthancClient();
        $study = $this->study;
		 
		$studyId = $study['MainDicomTags']['StudyID'] ?? null;
		
		$patient = Patient::where('study_id',$studyId)->first();
		 
		if(!$patient){
			return false;
		}
		
		$input['l_eye'] = $study['EyeAvailability']['l_eye'] ?? 0;
		$input['r_eye'] = $study['EyeAvailability']['r_eye'] ?? 0; 
		 
		$lEyeImages = !empty($patient['l_eye_images'])
			? json_decode($patient['l_eye_images'], true)
			: [];
	
		$rEyeImages = !empty($patient['r_eye_images'])
			? json_decode($patient['r_eye_images'], true)
			: [];
			
		$ext = \config('image.ext');  
		if($input['l_eye']){
			 	
			$leftEyeInstances = array_values(array_filter(
				$study['Instances'],
				fn($i) => strtolower($i['ImageLaterality'] ?? '') === 'l'
			));
			
			$uLeftEyeFiles = [];
			
			if(count($leftEyeInstances) != count($lEyeImages)){
				
				//$destinationPath = public_path('uploads/patients/' . $patient['slug']);
				$destinationPath = storage_path('app/public/uploads/patients/' . $patient['slug']);
				if (!file_exists($destinationPath)) {
					mkdir($destinationPath, 0755, true);
				}
				
				foreach($lEyeImages as $lEye){
					$files = glob($destinationPath . '/'.$lEye);  
					foreach ($files as $file) {
						if (is_file($file)) {
							unlink($file);  
						}
					}
				}
				  
				foreach($leftEyeInstances as $lInstance){
					 
					$imageData = $client->getRaw("/instances/{$lInstance['ID']}/preview");
					 
					$convertImage = \Helper::convertImages(
						$imageData,
						$destinationPath,
						\config('image.quality'),
						$ext,
						uniqid() . '-' . $lInstance['ID'] . '.'.$ext,
					);
					
					$uLeftEyeFiles[] = $convertImage['fileName'];
					  
				 
					// $lEfilename = uniqid().'-'.$lInstance['ID'].'.png';
					 
					// $path = $destinationPath.'/'.$lEfilename;
					// file_put_contents($path, $imageData);
					
					// $uLeftEyeFiles[] = $lEfilename;
					
				}
				$input['l_eye_images'] = json_encode($uLeftEyeFiles);
			}
		  
		}
		
		if($input['r_eye']){
			 
			$rightEyeInstances = array_values(array_filter(
				$study['Instances'],
				fn($i) => strtolower($i['ImageLaterality'] ?? '') === 'r'
			));
			
			$uRightEyeFiles = [];
			if(count($rightEyeInstances) != count($rEyeImages)){
				
				//$destinationPath = public_path('uploads/patients/' . $patient['slug']);
				$destinationPath = storage_path('app/public/uploads/patients/' . $patient['slug']);
				if (!file_exists($destinationPath)) {
					mkdir($destinationPath, 0755, true);
				}
				 
				foreach($rEyeImages as $rEye){
					$files = glob($destinationPath . '/'.$rEye);  
					foreach ($files as $file) {
						if (is_file($file)) {
							unlink($file);  
						}
					}
				}
				
				foreach($rightEyeInstances as $rInstance){
					 
					$imageData = $client->getRaw("/instances/{$rInstance['ID']}/preview");
					$convertImage = \Helper::convertImages(
						$imageData,
						$destinationPath,
						\config('image.quality'),
						$ext,
						uniqid() . '-' . $rInstance['ID'] . '.'.$ext,
					);
					
					$uLeftEyeFiles[] = $convertImage['fileName'];
					  
					// $rEfilename = uniqid().'-'.$rInstance['ID'].'.png';
					 
					// $path = $destinationPath.'/'.$rEfilename;
					// file_put_contents($path, $imageData);
					
					// $uRightEyeFiles[] = $rEfilename;
				}
				$input['r_eye_images'] = json_encode($uRightEyeFiles);
			}
		}
		
		$input['dicom_json'] = json_encode($study);
		try { 
			$patient->update($input);
		} catch (\Illuminate\Database\QueryException $e){
			logger()->warning("Duplicate study skipped: {$studyId}");
		}
		logger()->info("UpdateDicomData:: Patient:- {$patient['slug']} Study {$study['ID']} processed");
 
    }
}
