<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Patient extends Authenticatable
{
    use Notifiable;

	protected $table = 'patients'; 

	protected $appends = ['formated_created_at','display_left_eye_images','display_right_eye_images'];
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
	protected $fillable = [
		'slug','study_id','p_code','user_id', 'dob', 'gender', 'phone', 'clinic_id', 'ehr', 'address', 'city', 'state_id', 'zip', 
		'p_insurance_name', 'p_insurance_group_no', 'p_insurance_member_no', 's_insurance_name', 's_insurance_group_no', 
		's_insurance_member_no', 'l_eye', 'r_eye', 'l_eye_images', 'r_eye_images','medical_condition_id','medical_history', 'note','last_name','first_name',
		'latitude','longitude','diagnosis_status','remark_by','remark_status','remark_result','remark_at', 'email','follow_up','is_pdf_report_downloaded','pdf_report_downloaded_by','dicom_json','is_report_sent','report_sent_by','report_sent_at','fax_status','fax_job_id','fax_sent_by','fax_sent_at','fax_json','dos','created_at'
	];
	
	
	public static $rules = array(
		'first_name' => 'required|string|max:255', 
		'last_name' => 'required|string|max:255',
		//'dob' => 'required',
		'gender' => 'nullable|string|max:255',
		'phone' => 'required|regex:/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/',
		'clinic_id' => 'required',
		'ehr' => 'required|string|max:255',
		'address' => 'required',
		'email' => 'required|email',
		'city' => 'nullable|string|max:255',
		'state_id' => 'nullable|string|max:255',
		'zip' => 'nullable|string|max:10',
		'p_insurance_name' => 'required|max:255',
		'p_insurance_group_no' => 'required|max:255',
		'p_insurance_member_no' => 'required|max:255',
		's_insurance_name' => 'nullable|string|max:255',
		's_insurance_group_no' => 'nullable|string|max:255',
		's_insurance_member_no' => 'nullable|string|max:255',
		'l_eye' => 'nullable|integer',
		'r_eye' => 'nullable|integer',
		'l_eye_images' => 'required_if:l_eye,1|array',
		'r_eye_images' => 'required_if:r_eye,1|array',
		//'medical_condition_id' => 'required',
		//'medical_history' => 'required|array',
		'note' => 'nullable|string',
		 
    );
	public static $messages = array(
		 
		'state_id.required' => 'The state field is required.',
		 
    );
	
	public function remarkBy() 
    {
        return $this->hasOne('App\Models\User','id','remark_by');
    }
	
	public function postedBy() 
    {
        return $this->hasOne('App\Models\User','id','user_id');
    }
	
	public function clinic() 
    {
        return $this->hasOne('App\Models\Clinic','id','clinic_id');
    }
	
	public function user() 
    {
        return $this->hasOne('App\Models\user','id','user_id');
    }
	
	public function getDisplayLeftEyeImagesAttribute()
	{
		$value = $this->attributes['l_eye_images'];
		$arrFiles = !empty($value) ? json_decode($value, true) : [];
		$files = [];

		if (!empty($arrFiles)) {

			$files = collect($arrFiles)->map(function ($file) {

				$path = 'uploads/patients/' . $this->slug . '/' . $file;
				$exists = !empty($file) && \Storage::disk('public')->exists($path);
				$status = $exists ? 200 : 422;
				 
				$token = \Helper::fileTokenGen($path,$file,\Helper::hasSigned());
				$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
				$src = $signedUrl;
				
				return [
					'status' => $status,
					'src' => $status ? $src : asset('assets/images/dummy.png'),
					'name' => $file
				];
			})->values()->toArray(); // reset index (important)
		}

		return $files;
	}
	
	public function getDisplayRightEyeImagesAttribute()
	{
		$value = $this->attributes['r_eye_images'];
		$arrFiles = !empty($value) ? json_decode($value, true) : [];
		$files = [];

		if (!empty($arrFiles)) {

			$files = collect($arrFiles)->map(function ($file) {

				$path = 'uploads/patients/' . $this->slug . '/' . $file;
				$exists = !empty($file) && \Storage::disk('public')->exists($path);
				$status = $exists ? 200 : 422;
				 
				$token = \Helper::fileTokenGen($path,$file,\Helper::hasSigned());
				$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
				$src = $signedUrl;
				
				return [
					'status' => $status,
					'src' => $status ? $src : asset('assets/images/dummy.png'),
					'name' => $file
				];
			})->values()->toArray(); // reset index (important)
		}

		return $files;
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

