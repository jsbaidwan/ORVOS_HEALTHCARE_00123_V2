<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PatientDiagnosisMail extends Notification
{
    use Queueable;
	
	public $patient,$orvDoctor;
	 
    /**
     * Create a new notification instance.
     *
     * @return void
     */
	public function __construct($patient, $orvDoctor)
	{
		$this->patient = $patient;
		$this->orvDoctor = $orvDoctor;
	}

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
		$signedUrl = \Helper::genSignedUrl($this->patient->id, ['orvDoctor' => \Crypt::encryptString($this->orvDoctor)],\Helper::prefix('2')['prefix'].'.patients.diagnosis.view')['signedRoute'];
	
        return (new MailMessage)
		->subject('New Patient ' . $this->patient['first_name'],' '.$this->patient['last_name'])
		->greeting('Hello ' . $this->orvDoctor['first_name'] . ' '. $this->orvDoctor['last_name'].',')
		->line('A new patient diagnosis is available.')
		->action('View Diagnosis', $signedUrl)
		->line('Thank you for using our application!');

    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
