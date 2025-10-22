<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class UserAction implements ShouldBroadcast
{
    public $user;
    public $action;

    public function __construct(User $user, $action)
    {
        $this->user = $user;
        $this->action = $action;
    }

    public function broadcastOn()
    {
        return new Channel('users');
    }

    public function broadcastAs()
    {
        return 'user.' . $this->action; // user.create, user.update, user.delete
    }
}
