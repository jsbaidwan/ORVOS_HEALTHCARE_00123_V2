<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Patient extends Authenticatable
{
    use Notifiable;
 
	protected $table = 'patients'; 

	protected $appends = ['formated_created_at','display_left_eye_images','display_right_eye_images','medical_history','diagnosis_status_data','date_of_birth','medical_condition','medical_history_data','gender_data','report_download_status_data','report_sent_status','fax_status_data','dicom_file_status_data','follow_up_data','display_remark_at'];
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
	protected $fillable = [
		'slug','study_id','p_code','user_id', 'dob', 'gender', 'phone', 'clinic_id', 'ehr', 'address', 'city', 'state_id', 'zip', 
		'p_insurance_name', 'p_insurance_group_no', 'p_insurance_member_no', 's_insurance_name', 's_insurance_group_no', 
		's_insurance_member_no', 'l_eye', 'r_eye', 'l_eye_images', 'r_eye_images','medical_condition_id','medical_history', 'note','last_name','first_name',
		'latitude','longitude','diagnosis_status','remark_by','remark_status','remark_result','remark_at', 'email','follow_up','is_pdf_report_downloaded','pdf_report_downloaded_by','dicom_json','is_report_sent','report_sent_by','report_sent_at','fax_status','fax_job_id','fax_sent_by','fax_sent_at','fax_json','dos','is_dicom_file_send','dicom_file_sent_at','dicom_file_status','created_at'
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
					'src' => $status == 200 ? $src : asset('assets/images/dummy.png'),
					'name' => $file,
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
					'src' => $status == 200 ? $src : asset('assets/images/dummy.png'),
					'name' => $file
				];
			})->values()->toArray(); // reset index (important)
		}

		return $files;
	}
	
	public function getMedicalHistoryAttribute()
	{
		$value = $this->attributes['medical_history'];
		return !empty($value) ? json_decode($value,true) : null;
	}
	
	public function getDiagnosisStatusDataAttribute()
	{
		$diagnosisStatus = $this->attributes['diagnosis_status'];
		return empty($diagnosisStatus) ?  ['status' => 0,'name' => 'Pending','class' => 'warning','color' => 'yellow'] : ['status' => 1,'name' => 'Completed','class' => 'success','color' => 'green'];
	}
	
	public function getDosAttribute()
	{
		$dos = $this->attributes['dos'];
		return !empty($dos) ? \Carbon\Carbon::parse($dos)->format('D, M d Y') : NULL;
	}
	
	public function getDateOfBirthAttribute()
	{
		$dob = $this->attributes['dob'];
		return !empty($dob) ? \Carbon\Carbon::parse($dob)->format('D, M d Y') : NULL;
	}
	
	public function getDisplayRemarkAtAttribute()
	{
		$dob = $this->attributes['remark_at'];
		return !empty($dob) ? \Carbon\Carbon::parse($dob)->format('D, M d Y') : NULL;
	}
	
	public function getMedicalConditionAttribute()
	{
		$value = $this->attributes['medical_condition_id'];
		return !empty($value) ? \Helper::getMedicalConditionById($value)['medicalCondition'] : NULL;
	}
	
	public function getMedicalHistoryDataAttribute()
	{
		$ids = !empty($this->attributes['medical_history']) ?  $this->attributes['medical_history']  : [];
		return !empty($ids) ? \Helper::getMedicalHistoryById($ids)['medical_history'] :  [];
	}
	
	public function getGenderDataAttribute()
	{
		$gender = !empty($this->attributes['gender']) ?  $this->attributes['gender']  : [];
		return !empty($gender) ? \Helper::getGenderById($gender)['gender'] :  [];
	}
	 
	public function getReportDownloadStatusDataAttribute()
	{
		$value = $this->attributes['is_pdf_report_downloaded'];
		return \Helper::pdfReportDownloadStatusById($value)['pdfReportDownloadStatus'] ?? [];
	}
	
	public function getReportSentStatusAttribute()
	{
		$value = $this->attributes['is_report_sent'];
		return  $value ? ['status' =>'PDF Sent','class' => 'text-green-800'] : ['status' => 'PDF Pending','class' => 'text-warning'];
	}
	
	public function getFaxStatusDataAttribute()
	{
		$value = $this->attributes['fax_status'];
		$faxJson = $this->attributes['fax_json'];
		$faxStatusData = \Helper::faxStatusById($value);
		$faxArr = ($value == 3 && !empty($faxJson))
		? json_decode($faxJson, true)
		: [];
		
		$message = $faxArr['message'] ?? NULL;
														
		return  $faxStatusData['status'] == 200 ? [ 'class' => $faxStatusData['faxStatus']['class'],'name' => $faxStatusData['faxStatus']['name'],'message' => $message] : ['status' => 'No Status Found','class' => 'text-danger','name' => NULL,'message' => $message];
	}
	
	public function getDicomFileStatusDataAttribute()
	{
		$value = $this->attributes['is_dicom_file_send'];
		$dicomStatus = \Helper::dicomStatusById($value);
		  			
		$data = ['status' => $dicomStatus['status'],'message' => $this->attributes['dicom_file_status']];
		return  array_merge($data,$dicomStatus['dStatus'] ?? []);
	}
	
	public function getRemarkResultAttribute($value)
	{
		if (!is_string($value)) {
			$remarkResultArr = $value;
		} else {
			$decoded = json_decode($value, true);
			$remarkResultArr = json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
		}

		if (!is_array($remarkResultArr)) {
			return $remarkResultArr;
		}

		foreach (['leftEye', 'rightEye'] as $eye) {

			if (!empty($remarkResultArr['exam_data'][$eye])) {

				foreach ($remarkResultArr['exam_data'][$eye] as $index => $item) {
					
					// optional example data:
					$remarkResultArr['exam_data'][$eye][$index]['exam_type_arr'] = \Helper::getExamTypeById($this->attributes['medical_condition_id'],$item['exam_type'],$eye);
				}
			}
		}

		return $remarkResultArr;
	}
	
	public function getFollowUpDataAttribute()
	{
		$value = $this->attributes['follow_up'];
		$followUpData = \Helper::getFollowUpStatusById($value);
		return $followUpData;
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

