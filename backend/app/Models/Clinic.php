<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\User;
use App\Models\AdditionalSetting;

class Clinic extends Authenticatable
{
    use Notifiable;

	protected $table = 'clinics';  
	
	protected $appends = ['formated_created_at','is_active_status'];
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'clinic_group_id','user_id','image','name','slug','code','poc_email','phone','address','city','state_id','zip','description','status','doi','files','latitude','longitude'
    ];
	
	public static $rules = array(
		
		'name'  => 'required|unique:clinics',
		'code' => 'nullable|unique:clinics',
        //'poc_email' => 'required|email|unique:clinics',
		'poc_email' => 'required|email',
        'address' => 'required',
		'city' => 'required',
		'state_id' => 'required',
		'zip' => 'required',
        'doi' => 'required',
        'image' => 'nullable|mimes:jpeg,png,jpg,webp', 
		'phone' => 'nullable|regex:/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/'
		 
    );
	
	public static $messages = array(
		 
		'state_id.required' => 'The state field is required.'
	);
	
	public function clinicGroup() 
    {  
        return $this->belongsTo('App\Models\ClinicGroup', 'clinic_group_id');
	}

    public function clinicUsers() 
    {  
        return $this->hasMany('App\Models\ClinicUser','clinic_id','id');
    }
	
	public function clinicPatients() 
    {  
        return $this->hasMany('App\Models\Patient','clinic_id','id');
	}
	
    public function additionalSetting()
    {
        return $this->hasOne(AdditionalSetting::class, 'clinic_id','id');
    }
	
	public function getIsActiveStatusAttribute()
	{
		return \Helper::getIsActiveStatusById($this->status)['status'] ?? [];
		 
	}
	
	public function setDoiAttribute($value)
	{
        $this->attributes['doi'] = !empty($value) ? \Helper::changeDateFormat($value,'Y-m-d')['date'] : null;
 
	}
	
    public function getDoiAttribute($value)
	{
		return !empty($value) ? \Helper::changeDateFormat($value,'m-d-y')['date'] : null;
	}
	
	public function getFormatedCreatedAtAttribute()
	{
		if (empty($this->created_at)) {
			return '';
		}
		
		try {
			return \Helper::changeDateFormat($this->created_at,'D, M d Y')['date'];
		} catch (\Exception $e) {
			return '';
		}
	}

}
