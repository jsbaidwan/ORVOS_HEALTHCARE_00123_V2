<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Role extends Authenticatable
{
    use Notifiable;

	protected $table = 'roles';  
	 
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
   
}
