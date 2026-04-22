<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Notifications\PatientApptReminderMail;

class SendPatientApptReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $patient;
	protected $lastReminderDays;

    public function __construct($patient)
    {
        $this->patient = $patient;
		$this->lastReminderDays = $patient['last_reminder_days'];
		  
		
    }

    public function handle()
    {   
		$patient = $this->patient;
		$patient['last_reminder_days'] = $this->lastReminderDays;
		
		//$patient->email  = 'sandeep.intnxt@gmail.com';
		$patient->notify(new PatientApptReminderMail($patient));
		 
    }
}
