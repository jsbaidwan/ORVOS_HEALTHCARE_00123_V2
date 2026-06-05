<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\InsertDicomDataJob;
use App\Jobs\UpdateDicomDataJob;
use Mkinyua53\Orthanc\Facades\Patients;
use Mkinyua53\Orthanc\Facades\Studies;
use Mkinyua53\Orthanc\Facades\System;
use App\Models\Patient;
 
class FetchDicomDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
	protected $signature = 'dicom:fetch {id?} {type?} {action?}';
    
    /**
     * The console command description.
     *
     * @var string
     */
	protected $description = 'Fetch DICOM data from Orthanc and dispatch insert jobs';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
	    $id = $this->argument('id');
		$type = $this->argument('type');
		$action = $this->argument('action');
	
		sleep(5);
		
		$dicomArray = [];
		$seen = [];
		$startDate  = gmdate('Ymd', strtotime('-6 day'));
		$today = gmdate('Ymd');
		  
		if(!empty($id) && !empty($type)){
			  
			$studies = System::post("/tools/find", [
				"Level"  => "Study",
				"Expand" => true,
				"Query"  => [
					$type => $id
				]
			]);
			
		}else{
			
			$studies = System::post("/tools/find", [
				"Level"  => "Study",
				"Expand" => true,
				"Query"  => [
					"StudyDate" => $startDate  . "-" . $today
				]
			]);
		}
		  
		foreach($studies as $study){
			 
			$qStudyId = 'StudyID';
			if(empty($study['MainDicomTags']['StudyID'])){
				$qStudyId = 'StudyInstanceUID';
			}
			
			$studyId = $study['MainDicomTags']['StudyID'] ?: 
			($study['MainDicomTags']['StudyInstanceUID'] ?? null);

			$patientId = $study['ParentPatient'] ?? null;
			  
			// Build unique key (e.g., "12345_777")
			$uniqueKey = $studyId . '_' . $patientId;

			// Skip duplicates
			if (isset($seen[$uniqueKey])) {
				continue;
			}

			// Mark as processed
			$seen[$uniqueKey] = true;
		
			$patient = System::get("/patients/".$study['ParentPatient']);
			$study['Patient'] = $patient;
			 
			$study['Series'] = System::post("/tools/find", [
				'Level'  => 'Series',
				'Expand' => false,   // THIS includes all instance info + full tags
				'Query'  => [
					$qStudyId  => $studyId,
					'PatientID' => $patient['MainDicomTags']['PatientID']
				]
			]);
			
			$instances = System::post("/tools/find", [
				'Level'  => 'Instance',
				'Expand' => true,   // THIS includes all instance info + full tags
				'Query'  => [
					$qStudyId  => $studyId,
					'PatientID' => $patient['MainDicomTags']['PatientID']
				]
			]);
			
			if (count($instances) == 0) {
				continue;
			}
			// if (count($instances) < 2) {
				// continue;
			// }
			$totalSeriesNumber = [];
			foreach($instances as $instanceVal){
				$tags = System::get("/instances/".$instanceVal['ID']."/tags");
						
				$imageLaterality = $tags['0020,0062']['Value'][0] ?? null;
				$patientCommentsRaw = $tags['0010,4000']['Value'] ?? null;

				$patientComments = $patientCommentsRaw;

				// Try to decode JSON
				if (is_string($patientCommentsRaw)) {
					$decoded = json_decode($patientCommentsRaw, true);

					if (json_last_error() === JSON_ERROR_NONE) {
						$patientComments = $decoded; // Now array
					} else {
						$patientComments = []; // fallback to empty array
					}
				}
				 
				$study['Tags'] = $tags;
				$totalSeriesNumber[] = $tags['0020,0011'] ?? null;
				$study['DeviceSerialNumber'] = $tags['0018,1000']['Value'] ?? null;
				$instanceVal['ImageLaterality'] = $imageLaterality;
				if(strtolower($imageLaterality) == 'l'){
					$study['EyeAvailability']['l_eye'] = true;
				}
				if(strtolower($imageLaterality) == 'r'){
					$study['EyeAvailability']['r_eye'] = true;
				}
				$study['Patient']['PatientUID'] = !empty($patientComments['medicalRecordNumber'])
				? $patientComments['medicalRecordNumber']
				: $patient['MainDicomTags']['PatientID'];

				 
				$study['Instances'][] = $instanceVal;
			}
			
			$study['TotalSeriesNumber'] = $totalSeriesNumber ?? [];
			
			// Dispatch chained jobs to the queue
			if(!empty($action) && $action == 'update'){
				 
				UpdateDicomDataJob::dispatch($study)->onQueue('update-dicom-data')->delay(\Carbon\Carbon::now()->addSeconds(10));
			} else{
				
				$patient = Patient::where('study_id',$studyId)->first();
				if($patient){
					continue;
				}
				InsertDicomDataJob::dispatch($study)->onQueue('insert-dicom-data')->delay(\Carbon\Carbon::now()->addSeconds(10));
			}
			
			$dicomArray[] = $study; 
		}
		
		
		    
		// \Artisan::call('queue:work', [
            // '--stop-when-empty' => true,
			// '--queue' => 'insert-dicom-data',
            // '--tries' => count($dicomArray),
        // ]);
		
        $this->info('All DICOM data dispatched successfully.');
	   	
        return Command::SUCCESS;
    }
	
}

