<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
	
	 
    protected $fillable = [
	
        'name','code' 
	];
	
	protected $table = 'countries';

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
	 */
	 
	public static $rules = array(
		  
			  
	);
	 
	public function state(){
			
		return $this->hasOne('App\Models\State','country_code','code');
	}
	
}
