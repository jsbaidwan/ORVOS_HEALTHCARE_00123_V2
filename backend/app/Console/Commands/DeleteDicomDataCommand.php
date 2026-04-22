<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\InsertDicomDataJob;
use App\Jobs\UpdateDicomDataJob;
use Mkinyua53\Orthanc\Facades\Patients;
use Mkinyua53\Orthanc\Facades\Studies;
use Mkinyua53\Orthanc\Facades\System;
 
class DeleteDicomDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
	protected $signature = 'dicom:delete';
    
    /**
     * The console command description.
     *
     * @var string
     */
	protected $description = 'Delete DICOM data from Orthanc jobs';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    { 
	    $cutoff = now()->subDays(2)->format('Ymd'); // 2 days ago

		// 1. Get all patients
		$patients = System::get("/patients");

		foreach ($patients as $patientId) {

			// Get all studies of this patient
			$studies = System::get("/patients/$patientId/studies");

			// Track whether patient still has any recent study
			$hasRecentStudy = false;

			foreach ($studies as $study) {
				
				$studyId = $study['MainDicomTags']['StudyID']
				?? $study['MainDicomTags']['StudyInstanceUID']
				?? null;
				$studyDate = $study['MainDicomTags']['StudyDate'] ?? null;

				if ($studyDate) {
					if ($studyDate < $cutoff) {
						// Delete old study
						 
						$formattedDate = $studyDate
						? \Carbon\Carbon::createFromFormat('Ymd', $studyDate)
						: null;

						$dateDiff = $formattedDate
						? $formattedDate->diffInDays(\Carbon\Carbon::now())
						: null;
	
						// echo"<pre>delOldStudy - ";print_r($study['ID']);
						// echo"<pre>delOldDate - ";print_r($formattedDate?->format('m-d-Y H:i:s'));
						// echo"<pre>dateDiff - ";print_r($dateDiff);
						 
						System::delete("/studies/".$study['ID']);
					} else {
						// Patient has at least one recent study
						$hasRecentStudy = true;
					}
				}
				
			}

			// If patient has no studies left (all were old), delete the patient
			if (!$hasRecentStudy) {
				//echo"<pre>delPateint - ";print_r($patientId);
				System::delete("/patients/".$patientId);
			}
		}
		
		/*
		 *-----------------------------------------------------------------
		 * DELETE OTHER SERVER DATA
		 *-----------------------------------------------------------------
		 */
		 
		$params = [
			'stow_url'      => env('ORTHANC_ENDPOINT').':'.env('ORTHANC_PORT2'),
			'stow_username' => env('ORTHANC_USERNAME2'),
			'stow_password' => env('ORTHANC_PASSWORD2'),
			'stow_get'      => '/patients',
			'stow_post'     => '/',
		];
		// create service with clinic connection
		$dicom = new \App\Services\DicomService($params);
		 
		$patients = $dicom->qido();
		   
		foreach ($patients['data'] ?? [] as $patientId) {
			// Get studies of this patient

			$studies = $dicom->setGetUrl('/patients/' . $patientId . '/studies')->qido();
			
			$hasRecentStudy = false;
			
			foreach ($studies['data'] as $study) {
				 
				$studyDate = $study['MainDicomTags']['StudyDate'] ?? null;
				
				if ($studyDate) {
					if ($studyDate < $cutoff) {

						// Delete old study
						//$dicom->setGetUrl('/studies/'.$study['ID'])->delete();
						   
					} else {
						$hasRecentStudy = true;
					}
					 
				}
			}
			
			// Delete patient if no recent study left
			if (!$hasRecentStudy) {
				//$dicom->setGetUrl('/patients/' . $patientId)->delete();
				  
			}
			
		}
		/*
		 *-----------------------------------------------------------------
		 * DELETE OTHER SERVER DATA
		 *-----------------------------------------------------------------
		 */
		  
        $this->info('Delete DICOM data dispatched successfully.');
	   	
        return Command::SUCCESS;
    }
	
}

