<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\InsertDicomDataJob;
use Mkinyua53\Orthanc\Facades\Patients;
use Mkinyua53\Orthanc\Facades\Studies;
use Mkinyua53\Orthanc\Facades\System;
use App\Jobs\SendClinicPatientReportJob;
 
class ClinicPatientReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
	protected $signature = 'clinic-patient-reports:send-mail';
    
    /**
     * The console command description.
     *
     * @var string
     */
	protected $description = 'Generate and send password protected patient pdf reports to clinics via email.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
		$filters['diagnosis_status'] = 1; 
		$filters['is_report_sent'] = 0; 
		$filters['paginate'] = false;
		$filters['from_date'] = now()->subHours(8)->format('m-d-Y');
		$filters['to_date'] = now()->format('m-d-Y');
		$patients = \Helper::getPatients($filters)['patients'];
		  	
		foreach($patients as $patient){
			if(!empty($patient->clinic->is_patient_report_email_enabled)){
				SendClinicPatientReportJob::dispatch($patient)->onQueue('auto-send-clinic-patient-report');
			}	
		}
		
		\Artisan::call('queue:work', [
            '--stop-when-empty' => true,
            '--tries' => count($patients),
			'--queue' => 'auto-send-clinic-patient-report'
        ]);
		
        $this->info('Patient Password Protected PDF Reports sent to clinics via email successfully.');
	   	
        return Command::SUCCESS;
    }
}

