<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PendingPatientReminderMail extends Notification
{
    use Queueable;

    public $patients;

    public function __construct($patients)
    {
        $this->patients = $patients;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $count = count($this->patients);
		// Get unique clinic IDs
		$clinicIds = $this->patients->pluck('clinic_id')->unique();

		// Get the first (only) clinic ID as a single value
		$clinicId = $clinicIds->first(); // returns a single value, not a collection

		// Fetch the clinic
		$clinic = \Helper::getClinicById($clinicId)['clinic'] ?? null;
		 
        return (new MailMessage)
            ->subject('New Orvos Patient Added – Daily Reminder')
            ->greeting('Dear Dr. ' . $notifiable->first_name . ' ' . $notifiable->last_name . ',')
            ->line("You have {$count} pending patient(s) awaiting your review.")
			->line("There are patients that have been added to an Orvos queue that you are assigned to.")
            ->line('Please log in to evaluate the patients.')
			->action('Review Patients', url(\Helper::prefix('2')['prefix'].'/patients/pending'));
    }
}
