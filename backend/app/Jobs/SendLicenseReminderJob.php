<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Notifications\LicenseExpiryReminderMail;

class SendLicenseReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $doctor;
	protected $expiringLicenses; 
	protected $licenseExpiringDays; 
  
    public function __construct($doctor)
    {
        $this->doctor = $doctor;
		$this->expiringLicenses = $doctor->expiringLicenses;
		$this->licenseExpiringDays = $doctor->license_expiring_days;
	   
    }

    public function handle()
    {   
		$doctor = $this->doctor;
		$doctor['expiringLicenses'] = $this->expiringLicenses;
		$doctor['license_expiring_days'] = $this->licenseExpiringDays;
		
		$doctor->email = 'sandeep.intnxt@gmail.com';  
		$doctor->notify(new LicenseExpiryReminderMail($doctor));
   
    }
}
