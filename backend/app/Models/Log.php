<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
  
class Log extends Authenticatable
{
    use Notifiable;

	protected $table = 'logs';  
	
	protected $appends = [];
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id','url','text','description','method','ip','agent','module','module_id'
    ];
	
	public static $rules = array(
		
		  
    );
	
	public static $messages = array(
		 
		 
	);
	 
}
