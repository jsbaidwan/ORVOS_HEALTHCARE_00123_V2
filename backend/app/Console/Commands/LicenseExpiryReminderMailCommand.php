<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SendLicenseReminderJob;

class LicenseExpiryReminderMailCommand extends Command
{
    protected $signature = 'license-expiry:send-reminder';
    protected $description = 'Dispatch jobs to send reminder emails to Orvos doctors for their license expiry.';

    public function handle()
    {
       // Get all orvos doctors
		$filters['role_id'] = 2;
		$filters['status'] = 1;
		$filters['without_paginate'] = 1;
		$filters['expiry_reminder'] = 1;
		  
        $orvosDoctors = \Helper::users(false,$filters)['users'];
		
		// Today's date
		$today = \Carbon\Carbon::now()->toDateString();

		// Filter doctors with licenses expiring in 120 days
		$orvosDoctors = $orvosDoctors->filter(function ($doctor) use ($today) {

			$licenses = $doctor->licenses ?? collect();

			// Keep only licenses expiring in 120 days
			$expiringLicenses = $licenses->filter(function ($license) use ($today,$doctor) {
				$expiryDate = \Carbon\Carbon::parse($license->expiry_date);
				$diffDays = $expiryDate->diffInDays($today); // signed difference
				 
				if ($diffDays === 120) {
					$doctor['license_expiring_days'] = $diffDays;
					return true; // keep this license
				}

				return false; // discard
			});
			
			
			// Attach expiring licenses for email
			if ($expiringLicenses->isNotEmpty()) {
				$doctor->expiringLicenses = $expiringLicenses; // add as property
				return true;
			}

			return false;
		});
		 
        foreach ($orvosDoctors as $doctor) {
			 
			 // Create a unique cache key per doctor + today
			$cacheKey = "doctor_license_reminder_{$doctor->id}_{$today}";

			// Check if reminder already sent today
			if (!\Cache::has($cacheKey)) {

				// Dispatch job with all expiring licenses at once
				dispatch(new SendLicenseReminderJob($doctor));

				// Store in cache until end of day
				\Cache::put($cacheKey, true, now()->endOfDay());
 
			}
		}
		 
		 

		\Artisan::call('queue:work', [
            '--stop-when-empty' => true,
            '--tries' => count($orvosDoctors),
        ]);
        $this->info('All orvos doctor license expiry reminder jobs dispatched successfully.');
		return Command::SUCCESS;
    }
}
