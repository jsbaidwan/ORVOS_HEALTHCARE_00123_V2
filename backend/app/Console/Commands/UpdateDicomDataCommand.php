<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\InsertDicomDataJob;
use Mkinyua53\Orthanc\Facades\Patients;
use Mkinyua53\Orthanc\Facades\Studies;
use Mkinyua53\Orthanc\Facades\System;
use App\Console\Commands\FetchDicomDataCommand;
use App\Jobs\UpdateDicomDataJob;
 
class UpdateDicomDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
	protected $signature = 'dicom:update {id?}';
    
    /**
     * The console command description.
     *
     * @var string
     */
	protected $description = 'Fetch DICOM data from Orthanc and dispatch update jobs';

    /**
     * Execute the console command.
     *
     * @return int
     */
	 
	public function handle()
	{
		$id = $this->argument('id');
		
		$filters['not_empty_study_id'] = true;
		$filters['paginate'] = false;
		$filters['diagnosis_status'] = 0;
		$filters['id'] = $id;
		
		$patients = \Helper::getPatients($filters)['patients'];

		foreach($patients as $patient){

			if(empty($patient->study_id)){
				continue;
			}
			 
			\Artisan::call('dicom:fetch', [
				'id' => $patient->study_id,
				'type' => 'study',
				'action' => 'update'
			]);
		 
		}
		 
		\Artisan::call('queue:work', [
            '--stop-when-empty' => true,
			'--queue' => 'update-dicom-data',
            '--tries' => count($patients),
        ]);
		 
		return Command::SUCCESS;
	}

}

