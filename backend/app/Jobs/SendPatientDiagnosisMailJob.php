<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Notifications\PatientDiagnosisMail;
use Illuminate\Support\Facades\Notification;

class SendPatientDiagnosisMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public $patient;
	

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($patient)
    {
        $this->patient = $patient;
		 
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Get all orvos doctors
		$filters['role_id'] = 2;
		$filters['status'] = 1;
		$filters['state_id'] = $this->patient->clinic->state_id;
		$filters['without_paginate'] = 1;
		  
        $orvosDoctors = \Helper::users(false,$filters)['users'];
		  
        // Send email to each orvos doctors
        foreach ($orvosDoctors as $orvDoctor) {
			//$orvDoctor->email = 'sandeep.intnxt@gmail.com';
			$orvDoctor->notify(new PatientDiagnosisMail($this->patient, $orvDoctor));
 
        }
    }
}
