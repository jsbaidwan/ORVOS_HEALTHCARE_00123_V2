<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Notifications\PendingPatientReminderMail;

class SendPendingPatientReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $patients;
    protected $stateId;

    public function __construct($patients, $stateId)
    {
        $this->patients = $patients;
        $this->stateId = $stateId;
    }

    public function handle()
    {
        $filters = [
            'role_id' => 2,
            'status' => 1,
            'state_id' => $this->stateId,
            'without_paginate' => 1
        ];

        $orvosDoctors = \Helper::users(false, $filters)['users'];

        foreach ($orvosDoctors as $orvDoctor) {
			//$orvDoctor->email = 'sandeep.intnxt@gmail.com';  
            $orvDoctor->notify(new PendingPatientReminderMail($this->patients));
 
        }
		 
    }
}
