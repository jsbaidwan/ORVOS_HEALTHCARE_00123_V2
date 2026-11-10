<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Role extends Authenticatable
{
    use Notifiable;

	protected $table = 'roles';  
	
	protected $appends = ['u_id'];	
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'slug','active'
    ];
	
	public static $rules = array(
		
		'name'  => 'required|unique:roles',
		'slug' => 'nullable|unique:roles',
		 
    );
	
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
   
}
