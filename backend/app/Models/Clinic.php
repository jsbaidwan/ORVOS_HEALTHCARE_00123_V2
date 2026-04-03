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
  
	protected $appends = ['formated_created_at','is_active_status','display_files','display_image'];
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'clinic_group_id','image','name','slug','code','poc_email','phone','address','city','state_id','zip','description','status','doi','files','latitude','longitude','device_ids','device_type_id','is_patient_report_email_enabled','is_fax_enabled','fax_number','is_dicom_enabled','is_archived'
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
	
	public function state()
	{
		return $this->belongsTo('App\Models\State', 'state_id');
	}
	
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
	
    public function getDoiAttribute()
	{
		return !empty($this->attributes['doi']) ? \Carbon\Carbon::parse($this->attributes['doi'])->format('m-d-Y') : null;
	}
	
	public function setDeviceIdsAttribute($value)
	{
        $this->attributes['device_ids'] = !empty($value) ? json_encode($value) : null;
 
	}
	
	public function getDeviceIdsAttribute($value)
	{
		return !empty($value) ? json_decode($value,true) : null;
	}
	
	public function getDisplayFilesAttribute()
	{
		$value = $this->attributes['files'];
		$arrFiles = !empty($value) ? json_decode($value, true) : [];
		$files = [];

		if (!empty($arrFiles)) {

			$files = collect($arrFiles)->map(function ($file) {

				$path = 'uploads/clinics/' . $this->slug . '/' . $file;
				$exists = !empty($file) && \Storage::disk('public')->exists($path);
				$status = $exists ? 200 : 422;
				 
				$token = \Helper::fileTokenGen($path,$file,\Helper::hasSigned());
				$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
				$src = $signedUrl;
				
				return [
					'status' => $status,
					'src' => $status == 200 ? $src : asset('assets/images/dummy.png'),
					'name' => $file
				];
			})->values()->toArray(); // reset index (important)
		}

		return $files;
	}
	
	public function getDisplayImageAttribute()
	{
		$image = $this->attributes['image'];
		$path = "uploads/clinics/{$this->slug}/logo/$image";
		$exists = !empty($image) && \Storage::disk('public')->exists($path);
		$status = $exists ? 200 : 422;
		
		if ($status === 200) {
			 
			$token = \Helper::fileTokenGen($path,$image,\Helper::hasSigned());
			$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
			$src = $signedUrl;
			 
		} else {
			$src = asset('assets/images/dummy.png');
		}

		return [
			'status' => $status,
			'src' => $src,
			'name' => $image
		];
	}
	
	public function setStatusAttribute($value)
	{
        $this->attributes['status'] = !empty($value) ? 1 : 0;
 
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
