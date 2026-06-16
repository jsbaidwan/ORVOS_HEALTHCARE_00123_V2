<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class AdditionalSetting extends Authenticatable
{

    protected $fillable = [
        'clinic_id', 'data', 'user_id', 
    ];

    public static $rules = array(
		
		'clinic_id'  => 'required',
		 
    );

   
}