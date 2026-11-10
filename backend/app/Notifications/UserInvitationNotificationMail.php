<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class UserInvitationNotificationMail extends Notification 
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $invitationUrl;

    public function __construct(string $invitationUrl)
    {
        $this->invitationUrl = $invitationUrl;
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
	public function toMail($notifiable): MailMessage
    {
        $appName = config('app.name');
		$minutes = config('auth.passwords.user_invitations.expire');

		$seconds = $minutes * 60; // If $minutes contains minutes, convert to seconds

		if ($seconds >= 3600) {
			$hours = floor($seconds / 3600);
			$time = $hours . ' ' . ($hours == 1 ? 'hour' : 'hours');
		} elseif ($seconds >= 60) {
			$mins = floor($seconds / 60);
			$time = $mins . ' ' . ($mins == 1 ? 'minute' : 'minutes');
		} else {
			$time = $seconds . ' ' . ($seconds == 1 ? 'second' : 'seconds');
		}
		
		return (new MailMessage)
		->subject("You're Invited to {$appName}")
		->greeting('Hello ' . $notifiable->first_name . ',')
		->line("You have been invited to access {$appName}.")
		->line('Click the button below to securely set your password and activate your account.')
		->action('Set Your Password', $this->invitationUrl)
		->line(Lang::get('This password reset link will expire in :count.', ['count' =>  $time]))
		->line('If you were not expecting this invitation, please contact your administrator.');
		 
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
