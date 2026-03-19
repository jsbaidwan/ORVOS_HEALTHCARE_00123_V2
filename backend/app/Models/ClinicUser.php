<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\ClinicUser;

class ClinicUser extends Authenticatable
{
    use Notifiable;

	protected $table = 'clinic_users';  
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id','clinic_id','is_admin'
    ];
	
	public static $rules = array(
		
		'user_id'  => 'required',
		'clinic_id' => 'required',
         
		 
    );

    public function clinic() 
    {  
        return $this->hasOne('App\Models\Clinic','id','clinic_id');

    }

    public function user() 
    {  
        return $this->hasOne('App\Models\User','id','user_id');

    }
       
}
