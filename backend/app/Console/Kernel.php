<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
		//$schedule->command('pending-patients:send-reminder')->cron('0 */8 * * *');
		//$schedule->command('patients-appointment:send-reminder')->dailyAt('01:00');
		//$schedule->command('license-expiry:send-reminder')->dailyAt('01:00');
		//$schedule->command('dicom:fetch')->cron('*/3 * * * *');
		$schedule->command('dicom:fetch')
		->everyThirtyMinutes()
		->timezone(config('app.custom_timezone'))
        ->between('01:00', '07:00')
		->withoutOverlapping()->runInBackground();
		$schedule->command('dicom:send')->cron('1-59/3 * * * *')->withoutOverlapping()->runInBackground();
		$schedule->command('dicom:update')->cron('1-59/3 * * * *')->withoutOverlapping()->runInBackground();
		//$schedule->command('dicom:delete')->dailyAt('01:00');
		// $schedule->command('dicom:delete')
         // ->dailyAt('08:00')
         // ->timezone(config('app.custom_timezone'))->withoutOverlapping()->runInBackground();
		//$schedule->command('clinic-patient-reports:send-mail')->everyFourHours();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
