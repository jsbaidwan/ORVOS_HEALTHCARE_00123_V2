<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SignUpMail extends Notification implements ShouldQueue
{
    use Queueable;

    protected $password;
    protected $appUrl;

    public function __construct($password, $appUrl = null)
    {
        $this->password = $password;
        $this->appUrl = $appUrl.'/login' ?? url('/login'); // fallback to default login
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
		$companies = $notifiable->companies;
		$companyAlias = NULL;
		if(!empty($companies) && count($companies) > 0){
			$companyAlias = collect($companies)->pluck('alias')->filter()->implode(', ');
		}
		 
        return (new MailMessage)
            ->subject('Your account at ' . config('app.name') . ' is ready')
            ->greeting('Hello ' . $notifiable->first_name . ',')
            ->line('Thanks for signing up at ' . config('app.name') . '!')
			->line('Here’s your Company ID/Alias:')
			->line('**' . $companyAlias . '**')
			->line('Here’s your registered email:')
			->line('**' . $notifiable->email . '**')
            ->line('Here’s your password:')
            ->line('**' . $this->password . '**')
            ->line('Please log in and change this password to something secure.')
            ->action('Login Now', $this->appUrl)
            ->line('We’re glad to have you with us!');
    }
}


