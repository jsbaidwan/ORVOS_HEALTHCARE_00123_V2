<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;
	
	protected $table = 'permissions';
	
	protected $appends = ['u_id'];	
	 
	protected $fillable = [
	
       'role_id','module_id','read','write','create','delete'
	];
	 
	public static $rules = array(
	   'role_id' => 'required',
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
 