<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SyncDicomServerDataJob;
 
class SyncDicomServerDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
	protected $signature = 'dicom:sync-server-data';
  
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync DICOM data from Optos Orthanc to Main Orthanc';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
		$filters['paginate'] = false;
		$filters['status'] = 1;
		$filters['is_stow_enabled'] = 1;
		$clinics = \Helper::getClinics($filters)['clinics'];
		
		foreach($clinics as $clinic){
			
			$clinicPatients = $clinic['clinicPatients']->where('diagnosis_status', 0)->whereBetween('created_at', [now()->subDay(16), now()]);
			
			foreach($clinicPatients as $patient){
				 
				SyncDicomServerDataJob::dispatch($patient)->onQueue('sync-dicom-server-data')->delay(\Carbon\Carbon::now()->addSeconds(10));
				 
			}
		}
		 
        return Command::SUCCESS;
    }
}
