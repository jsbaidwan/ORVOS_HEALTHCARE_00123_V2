<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SendPendingPatientReminderJob;

class PendingPatientReminderMailCommand extends Command
{
    protected $signature = 'pending-patients:send-reminder';
    protected $description = 'Dispatch jobs to send reminder emails to Orvos doctors with pending patients grouped by state';

    public function handle()
    {
        $filters['diagnosis_status'] = 0;
		$pendingPatients = \Helper::getPatients($filters)['patients'];

        // Group patients by clinic->state_id
		$patientsByState = $pendingPatients->groupBy(fn($patient) => optional($patient->clinic)->state_id);
		 
        foreach ($patientsByState as $stateId => $patients) {
			if (!$stateId) continue;
			
            dispatch(new SendPendingPatientReminderJob($patients, $stateId));
        }

		\Artisan::call('queue:work', [
            '--stop-when-empty' => true,
            '--tries' => count($patientsByState),
        ]);
        $this->info('All pending patient reminder jobs dispatched successfully.');
		return Command::SUCCESS;
    }
}
