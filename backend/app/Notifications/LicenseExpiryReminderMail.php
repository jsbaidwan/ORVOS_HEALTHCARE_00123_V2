<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class LicenseExpiryReminderMail extends Notification
{
    use Queueable;

    public $doctor;

    public function __construct($doctor)
    {
        $this->doctor = $doctor;
		
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
		$doctor = $this->doctor;
		 
        $expiringLicenses = $doctor->expiringLicenses;
		 
        return (new MailMessage)
			->cc('charles.callender@orvoshealthcare.com')
			->subject('License Expiration Reminder')
            ->greeting('Dear Dr. ' . ($doctor['first_name'] ?? '') . ' ' . ($doctor['last_name'] ?? '') . ',')
			->markdown('emails.license_expiry', [
				'doctor' => $doctor,
				'licenses' => $expiringLicenses,
			]);
			 
    }
}
