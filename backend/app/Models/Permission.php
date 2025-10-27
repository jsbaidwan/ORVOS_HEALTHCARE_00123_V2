<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;
	
	protected $table = 'permissions';
	 
	protected $fillable = [
	
       'role_id','module_id','read','write','create','delete'
	];
	 
	public static $rules = array(
	   'role_id' => 'required',
	);
	 
}
 