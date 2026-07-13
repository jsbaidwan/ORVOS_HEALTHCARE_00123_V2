<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
	 
    protected $fillable = [
	
        'name','country_id'
	];
	
	protected $table = 'states';

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
	 
	public static $rules = array(
	 
		//	  
	);
	  
}
