<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PatientApptReminderMail extends Notification
{
    use Queueable;

    public $patient;

    public function __construct($patient)
    {
        $this->patient = $patient;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {  
		$patient = $this->patient;
	 
		return (new MailMessage)
			->subject('Retina Screening Reminder')
			->greeting('Hello, ' . ($patient['first_name'] ?? '') . ' ' . ($patient['last_name'] ?? '') . ',')
			->line('It has been ' . ($patient['last_reminder_days'] ?? '') . ' days since your last retina screening with clinic ' . ($patient['clinic']['name'] ?? '') . '.')
			->line('Please contact the clinic below to schedule another check up.') 
			->line('')
			->line(($patient['clinic']['description'] ?? ''));
			 
    }
}
