<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\InsertDicomDataJob;
use Mkinyua53\Orthanc\Facades\Patients;
use Mkinyua53\Orthanc\Facades\Studies;
use Mkinyua53\Orthanc\Facades\System;
use App\Console\Commands\FetchDicomDataCommand;
use App\Jobs\SendDicomDataJob;
 
class SendDicomDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
	protected $signature = 'dicom:send';
    
    /**
     * The console command description.
     *
     * @var string
     */
	protected $description = 'Fetch patients from the last 24 hours and dispatch jobs to send their DICOM data to the configured endpoint';

    /**
     * Execute the console command.
     *
     * @return int
     */
	 
	public function handle()
	{
		$filters['not_empty_study_id'] = true;
		$filters['paginate'] = false;
		$filters['diagnosis_status'] = 1;
		$filters['from_date'] = now()->subDay()->format('m-d-Y');
		$filters['to_date'] = now()->format('m-d-Y');
		$filters['is_dicom_file_send'] = [3];
		 
		$patients = \Helper::getPatients($filters)['patients'];
		foreach($patients as $patient){
				
			if($patient->clinic->is_stow_enabled){
				SendDicomDataJob::dispatch($patient)->onQueue('send-dicom-data')->delay(\Carbon\Carbon::now()->addSeconds(10));
			}
			
		}
		  
		return Command::SUCCESS;
	}

}

