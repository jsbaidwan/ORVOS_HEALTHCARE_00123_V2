<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;

class AppSession extends Model
{
    protected $table = 'app_sessions';

    protected $fillable = [
        'oauth_access_tokens_id',
        'device_info',
    ];
  
    public function accessToken()
    {
        return $this->belongsTo(
            \Laravel\Passport\Token::class,
            'oauth_access_tokens_id'
        );
    }
}
