<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SendPatientApptReminderJob;
use App\Models\AdditionalSetting;

class PatientAppointmentReminderMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'patients-appointment:send-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch jobs to send reminder emails to patients for their appointments.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {  
		$filters['diagnosis_status'] = 1;
		$today = \Carbon\Carbon::now()->toDateString(); 
		$patients = \Helper::getPatients($filters)['patients'];
		 
		$patients = $patients->filter(function ($patient) use ($today) {
  
            $lastImageDate = \Carbon\Carbon::parse($patient->created_at);
			 
            // Difference in days between last image and today
            $diffDays = \Carbon\Carbon::parse($today)->diffInDays($lastImageDate);
			$patient['last_reminder_days'] = $diffDays;
            // Send reminder if diffDays > 0 and is a multiple of 120
            return $diffDays > 0 && $diffDays % 120 === 0;
        });
		
		foreach($patients as $patient){
			 
			if(!empty($patient->clinic_id)){
				$settings = AdditionalSetting::where('clinic_id', $patient->clinic_id)->first();
				$settingsData = $settings ? json_decode($settings->data, true) : [];
				if (!empty($settingsData['patient_appointment_reminders'])){
					
					if($settingsData['patient_appointment_reminders'] == 'on'){
						 
						 // Unique cache key for patient + today
						$cacheKey = "patient_reminder_sent_{$patient->id}_{$today}";

						// If not already sent today
						if (!\Cache::has($cacheKey)) {
							// Dispatch job
								
							dispatch(new SendPatientApptReminderJob($patient));

							// Store in cache until the end of the day (so duplicate cron runs today won't send again)
							\Cache::put($cacheKey, true, now()->endOfDay());
						}
					}
					 
				}
			}
		}
		 
		\Artisan::call('queue:work', [
            '--stop-when-empty' => true,
            '--tries' => count($patients),
        ]);
		
        $this->info('All patient appointments reminder jobs dispatched successfully.');
        return Command::SUCCESS;
    }
}
