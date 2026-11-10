<?php

namespace App\Jobs;

use App\Notifications\UserInvitationNotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class SendUserInvitationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected string $invitationUrl;

    public function __construct($user, string $invitationUrl)
    {
        $this->user = $user;
        $this->invitationUrl = $invitationUrl;
 
    }

    public function handle(): void
    {
		//$this->user->email = 'sandeep.intnxt@gmail.com';
		 
        Notification::send(
            $this->user,
            new UserInvitationNotificationMail($this->invitationUrl)
        );
    }
}
