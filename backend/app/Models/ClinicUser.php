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
	
	protected $appends = ['formated_created_at','u_id'];
	 
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
	
	/*
	|--------------------------------------------------------------------------
	| Decrypt ID when retrieving
	|--------------------------------------------------------------------------
	*/
 
	public function setUIdAttribute($value)
	{
		if (!\Helper::hasEncrypt()) {
			$this->attributes['id'] = $value;
			return;
		}

		$this->attributes['id'] = \Helper::decryptData($value)['decrypt'];
	}
	
	/*
	|--------------------------------------------------------------------------
	| Encrypt ID when storing
	|--------------------------------------------------------------------------
	*/
 

	public function getUIdAttribute()
	{
		if (!\Helper::hasEncrypt()) {
			return $this->attributes['id'];
		}

		return \Helper::encryptData($this->attributes['id'])['encrypt'];
	}
	
	public function getFormatedCreatedAtAttribute()
	{
		if (empty($this->created_at)) {
			return '';
		}
		
		try {
			return \Carbon\Carbon::parse($this->created_at)->format('D, M d Y');
		} catch (\Exception $e) {
			return '';
		}
	}
       
}
