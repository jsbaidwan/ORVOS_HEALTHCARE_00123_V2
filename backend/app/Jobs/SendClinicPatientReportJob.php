<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Notifications\ClinicPatientReportMail;

class SendClinicPatientReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $patient;

    public function __construct($patient)
    {
        $this->patient = $patient;
    }

    public function handle()
    { 
		$patient = $this->patient;
        $patient->clinic->email = $patient->clinic->poc_email ?? NULL; 
		$patient->clinic->email = 'sandeep.intnxt@gmail.com';   
		$patient->clinic->notify(new ClinicPatientReportMail($patient));
  
    }
}
