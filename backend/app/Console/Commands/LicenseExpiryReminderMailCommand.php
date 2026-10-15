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
		// Get all active Orvos Doctors
		$filters['role_id'] = 2;
		$filters['status'] = 1;
		$filters['without_paginate'] = 1;
		$filters['expiry_reminder'] = 1;

		$orvosDoctors = \Helper::users(false, $filters)['users'];

		// Today's date
		$today = \Carbon\Carbon::today();

		// Last date for sending expiry reminders
		$reminderEndDate = $today->copy()->addDays(120);

		// Filter doctors with licenses expiring within the next 120 days
		$orvosDoctors = $orvosDoctors->filter(function ($doctor) use ($today, $reminderEndDate) {

			$licenses = $doctor->licenses ?? collect();

			$expiringLicenses = $licenses->filter(function ($license) use ($today, $reminderEndDate) {

				// Skip licenses without an expiry date
				if (empty($license->expiry_date)) {
					return false;
				}

				// Parse license expiry date
				$expiryDate = \Carbon\Carbon::parse($license->expiry_date)->startOfDay();

				// Exclude expired licenses
				if ($expiryDate->lt($today)) {
					return false;
				}

				// Exclude licenses expiring after the next 120 days
				if ($expiryDate->gt($reminderEndDate)) {
					return false;
				}

				// Calculate remaining days until expiry
				$diffDays = (int) $today->diffInDays($expiryDate);

				// Attach remaining days to the license for the email
				$license->license_expiring_days = $diffDays;

				return true;
			});

			// Attach matching licenses to the doctor for the email
			if ($expiringLicenses->isNotEmpty()) {
				$doctor->expiringLicenses = $expiringLicenses;

				return true;
			}

			return false;
		});
		
		// Dispatch reminder jobs
		foreach ($orvosDoctors as $doctor) {

			// Unique cache key per doctor and date
			$cacheKey = "doctor_license_reminder_{$doctor->id}_{$today->toDateString()}";

			// Prevent duplicate dispatches on the same day
			if (!\Cache::has($cacheKey)) {
 
				dispatch(new SendLicenseReminderJob($doctor));

				// Store cache until the end of today
				\Cache::put($cacheKey, true, $today->copy()->endOfDay());
			}
		}

		// Process queued jobs
		if ($orvosDoctors->isNotEmpty()) {
			\Artisan::call('queue:work', [
				'--stop-when-empty' => true,
				'--tries' => max(1, $orvosDoctors->count()),
			]);
		}

		$this->info(
			"License expiry reminders processed successfully. Matching doctors: {$orvosDoctors->count()}."
		);

		return Command::SUCCESS;
	}


}
