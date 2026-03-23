<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Validation\Rule;

class ClinicGroup extends Authenticatable
{
    use Notifiable;

	protected $table = 'clinic_groups';  
	
	protected $appends = ['formated_created_at','is_active_status'];
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id','name','code','description','image','active','is_archived'
    ];
	
	public static function rules($id = null)
	{
		return [
			'name' => [
				'required',
				Rule::unique('clinic_groups', 'name')->ignore($id),
			],
			'description' => 'required',
		];
	}
	
	public function getIsActiveStatusAttribute()
	{
		return \Helper::getIsActiveStatusById($this->active)['status'] ?? [];
		 
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
