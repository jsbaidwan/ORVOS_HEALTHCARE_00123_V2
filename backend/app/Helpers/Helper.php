<?php

namespace App\Helpers;

use Auth;
use Carbon\Carbon;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI as cOpenAI;
use GuzzleHttp\Client; 
use Jenssegers\Agent\Agent;
use App\Models\Role;
use App\Models\User;
use App\Models\Clinic;
use App\Models\ClinicUser;
use App\Models\Country;
use App\Models\State;
use App\Models\Patient;
use App\Models\Permission;
use Illuminate\Http\UploadedFile;
use App\Models\PdfTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class Helper{
	 
	/*
	 * ------------------------
	 * Start: All roles
	 * ------------------------
	 */
	 public static function getRoles($isAdmin = false)
	 {
		$query = Role::OrderBy('id','ASC');
		if($isAdmin == true){
			$query->where('id','!=',1);
		}
		$roles = $query->get();
		 
		return ['roles' => $roles];
			 
	 } 

	/*
	 * ------------------------
	 * End: All roles
	 * ------------------------
	 */

	/*
	 *------------------------
	 * Start: Get role by id
	 * ------------------------
	 */
	public static function roleById($id)
	{
		$roles = self::getRoles()['roles'];

		foreach ($roles as $role) {
			if ($role->id == $id || $role->slug == $id ) {
				return ['status' => 200,'role' => $role]; // Return the role if found
			}
		}
	
		return ['status' => 422]; // Return null if role with given ID is not found	
	} 

   /*
	* ------------------------
	* End: Get role by id
	* ------------------------
	*/


	/*
	* ------------------------
	* Start: Get users
	* ------------------------
	*/

	public static function users($isAdmin = false,$filters = [])
	{
		$query = User::with('clinicUsers','licenses')->orderBy('id', 'DESC');

		if(!empty($filters['role_id'])){
			$query->where('role_id', $filters['role_id']);
		}
		if(!empty($filters['slug'])){
			$slug = $filters['slug'];
			$query->whereHas('roles',function($q) use ($slug){
				$q->where('slug',$slug);
			});
		}
		if(isset($filters['status'])){
			$query->where('status', $filters['status']);
		}
		
		if(isset($filters['expiry_reminder'])){
			$query->where('expiry_reminder', $filters['expiry_reminder']);
		}
		
		if(!empty(\Auth::user()) ){
			if(\Auth::user()->role_id != 1){
				 
				if(!empty($filters['state_id'])){ 
					$query->whereHas('licenses',function($q) use($filters){
						$q->where('l_state_id',$filters['state_id']);
					});
				}
				  
				$query->whereHas('clinicUsers',function($q)  {
					$q->whereIn('clinic_id',\Auth::user()->clinicUsers->pluck('clinic_id'));
				});
			}
		}else{
			
			if(!empty($filters['role_id']) && $filters['role_id'] == 2){
				 
				if(!empty($filters['state_id'])){ 
					$query->whereHas('licenses',function($q) use($filters){
						$q->where('l_state_id',$filters['state_id']);
					});
				}
				   
			}
			
		}
		 
		if(!empty($filters['without_paginate'])){
			$users = $query->get();
		}else{
			$users = $query->paginate();
		}
		
		return ['users' => $users];
	}

	/*
	* ------------------------
	* End: Get users
	* ------------------------
	*/


	/*
	* ------------------------
	* Start: Get user by id
	* ------------------------
	*/

	public static function getUserById($id)
	{
		$user = User::with('clinicUsers','licenses')->find($id);
		
		return ['user' => $user];
	}

	/*
	* ------------------------
	* End: Get user by id
	* ------------------------
	*/
	 
	/*
	 *------------------------------
	 * Start: Get user image
	 * -----------------------------
	 */
	public static function userImg($id)
	{
		$user = User::find($id);
		if(!$user){
			return ['image' => url('public/assets/img/dummy-user.jpg')];
		}

		$dir = public_path('uploads/users/').'/'.$user->user_name.'/'.$user->image;
		 
		if(!empty($user->image) && file_exists($dir)){
			$image = url('public/uploads/users/').'/'.$user->user_name.'/'.$user->image;
		}else{
			$image = url('public/assets/img/dummy-user.jpg');
		}

		return ['image' => $image];
	} 

   	/*
	 *------------------------------
	 * End: Get user image
	 * -----------------------------
	 */
	 
	
	 
	 /*
	 *------------------------------
	 * Start: Get patients
	 * -----------------------------
	 */
	
	public static function getPatients($filters = [])
	{
		$query = Patient::with('remarkBy','user')->orderBy('id','DESC');
		
		/*if (isset($filters['from_date']) && isset($filters['to_date'])) {
			$from = \Carbon\Carbon::createFromFormat('m-d-Y', $filters['from_date'])->format('Y-m-d');
			 
			$to = \Carbon\Carbon::createFromFormat('m-d-Y', $filters['to_date'])->format('Y-m-d');
			 //$query->whereBetween('created_at', [$from, $to]);
			 $query->whereDate('created_at', '>=', $from)->whereDate('created_at', '<=', $to);
		} elseif (isset($filters['from_date'])) {
			$from = \Carbon\Carbon::createFromFormat('m-d-Y', $filters['from_date'])->format('Y-m-d');
			$query->whereDate('created_at', $from);
		} elseif (isset($filters['to_date'])) {
			$to = \Carbon\Carbon::createFromFormat('m-d-Y', $filters['to_date'])->format('Y-m-d');
			$query->whereDate('created_at', $to);
		}*/
		
		$from = null;
		$to   = null;
		// If month is set → define base start and end of month
		if (!empty($filters['month'])) {
			$month = \Carbon\Carbon::createFromFormat('m-Y', $filters['month']);
			$from  = $month->copy()->startOfMonth();
			$to    = $month->copy()->endOfMonth();
		}

		// If from_date is set → narrow the lower bound
		if (!empty($filters['from_date'])) {
			$fromDate = \Carbon\Carbon::createFromFormat('m-d-Y', $filters['from_date']);
			$from = $from ? $fromDate->greaterThan($from) ? $fromDate : $from : $fromDate;
		}

		// If to_date is set → narrow the upper bound
		if (!empty($filters['to_date'])) {
			$toDate = \Carbon\Carbon::createFromFormat('m-d-Y', $filters['to_date']);
			$to = $to ? $toDate->lessThan($to) ? $toDate : $to : $toDate;
		}

		// Apply condition
		if ($from && $to) {
		   $query->whereDate('created_at', '>=', $from->format('Y-m-d'))->whereDate('created_at', '<=', $to->format('Y-m-d'));
		} elseif ($from) {
			$query->whereDate('created_at', $from->format('Y-m-d'));
		} elseif ($to) {
			$query->whereDate('created_at', $to->format('Y-m-d'));
		}
		
		if(!empty($filters['remark_by'])){
			 
			$query->where('remark_by',$filters['remark_by']);
		}
 
		if(!empty($filters['first_name'])){
			 
			$query->where('first_name', 'like', '%' . $filters['first_name'] . '%');
		}
		
		if(!empty($filters['last_name'])){
			 
			$query->where('last_name', 'like', '%' . $filters['last_name'] . '%');
		}
		
		if(!empty($filters['ehr'])){
			 
			$query->where('mr_number',$filters['ehr']);
		}
        
		if (!empty($filters['orvos_doctors']) || !empty($filters['choose_state'])) {
			
			if(!empty($filters['orvos_doctors']) && !is_array($filters['orvos_doctors'])){
				$filters['orvos_doctors'] = json_decode($filters['orvos_doctors'],true);
			 
			}
			if(!empty($filters['choose_state']) && !is_array($filters['choose_state'])){
				$filters['choose_state'] = json_decode($filters['choose_state'],true);
				
			}
			 
			if (!empty($filters['orvos_doctors']) && empty($filters['choose_state'])) {
				$query->whereIn('remark_by', $filters['orvos_doctors']);
			}
		
		
			if (!empty($filters['orvos_doctors']) && !empty($filters['choose_state'])) {
				$query->whereHas('clinic', function ($q) use ($filters) {
					$q->whereIn('state_id', $filters['choose_state']);
				})->whereIn('remark_by', $filters['orvos_doctors']);
			}
			
		}
		 

		if(isset($filters['diagnosis_status'])){
			$query->where('diagnosis_status',$filters['diagnosis_status']);
		}
		if(isset($filters['remark_status'])){
			$query->where('remark_status',$filters['remark_status']);
		}
		if(isset($filters['clinic_id'])){
			 
			$query->where('clinic_id',$filters['clinic_id']);
		}
		 
		if(\Auth::user() && \Auth::user()->role_id != 1){
			 
			if(\Auth::user()->role_id == 2){
				 
				$query->whereHas('clinic',function($q) {
					$q->whereIn('state_id', \Auth::user()->licenses->pluck('l_state_id'));
				});
				
				if(isset($filters['diagnosis_status']) && $filters['diagnosis_status'] == 1){
					$query->where('remark_by',\Auth::user()->id);
				}
				//$query->where('state_id',\Auth::user()->state_id);
				 
			} else{
				if(isset($filters['clinic_ids'])){
			 
					$query->whereIn('clinic_id',$filters['clinic_ids']);
				}
				if(\Auth::user()->role_id != 6){
					// Comment on 8/9/2025
					//$query->where('user_id',\Auth::user()->id);
				} 
				
			}
			 
		}
		
		// Comment on 8/9/2025
		$query->whereHas('clinic', function ($q) {
			$q->where('status', 1);
		});
			
		if(!empty($filters['export_excel'])){
			$patients = $query->get();
        }else if(isset($filters['paginate']) && $filters['paginate'] == false){
			$patients = $query->get();
		} else{
			$patients = $query->paginate();
		}  
		
		
		return ['patients' => $patients];
	}
	 
	 /*
	 *------------------------------
	 * End: Get patients
	 * -----------------------------
	 */
	 
	 
	/*
	 *------------------------------
	 * Start: Get patient By id
	 * -----------------------------
	 */
	
	public static function getPatientById($id)
	{
		$patient = Patient::find($id);
		if(!$patient){
			return ['patient' => Null];
		}
		return ['patient' => $patient];
	}
	
	/*
	 *------------------------------
	 * End: Get patient By id
	 * -----------------------------
	 */
	 
	 
	  /*
	 *------------------------------
	 * Start: Get patient eye images
	 * -----------------------------
	 */
	 
	public static function getPatientEyeImgs($id,$field,$actionBtn = true)
	{
		$patient = Patient::find($id);
		if(!$patient){
			
			return ['status' => 422,'html' => ''];
		}
		$html = '<div class="row">'; 
		if(!empty($patient->$field)){
			$images = json_decode($patient->$field,true);
			if(!empty($images)){
				 
				$totalImages = count(array_filter($images)); // filter out empty images

				foreach($images as $key => $image){
					if(!empty($image)){
						$imageUrl = asset('uploads/patients/'.$patient->slug.'/'.$image);
						
						$imgData = [
							'image' => $image,
							'imageUrl' => $imageUrl,
							'field' => $field,
							'key' => $key
						];

						// Decide column size based on total images
						$colClass = ($totalImages == 1) ? 'col-md-8 col-12' : 'col-md-4 col-12';

						$html .= '<div class="px-0 '.$colClass.' prev-col">';
						$html .= self::eyeHtmlTemplate($imgData, $actionBtn,$totalImages,'patients')['html'];
						$html .= '</div>'; 
					}
				}
			}
		} 
		$html .= '</div>';
		 
		return ['status' => 200,'html' => $html];
	}
	 
	 /*
	 *------------------------------
	 * End: Get patient eye images
	 * -----------------------------
	 */
	 
	/*
	 *----------------------------------------
	 * Start: Get patient eye images template
	 * ---------------------------------------
	 */
	 
	public static function eyeHtmlTemplate($data,$actionBtn,$totalImages = 0,$page = NULL)
	{  
		$randomNumber = rand(1000000, 9999999);
		$style = '';
		if($page !='patients' && $totalImages == 1){
			$style = 'style="width:300px !important;"';
		}
		  
		$html  = '<div class="img-container" data-name="'.basename($data['image']).'">';
			if($actionBtn == true){
				$html .= '<button type="button" class="dropzone-remove"><i class="fa fa-trash"></i></button>';
			}
			$html .= '<a href="javascript:void(0)" data-toggle="modal" data-target="#zoomEyeModal-' . $data['field'] . '-' . $data['key'] . '-' . $randomNumber . '">';

				$html .= '<img src="'.$data['imageUrl'] .'" class="img-fluid eye-img" '.$style.'>';
				
				$html .= '<input type="hidden" name="'.$data['field'].'[]" value="'.$data['imageUrl'] .'">';
			$html .= '</a>'; 
		$html .= '</div>'; 
		
		
		$html .= '<div class="modal fade" id="zoomEyeModal-' . $data['field'] . '-' . $data['key'] . '-' . $randomNumber . '" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" bis_skin_checked="1" style="display: none;" aria-hidden="true">';
			$html .= '<div class="modal-dialog modal-dialog-centered" role="document" bis_skin_checked="1">';
			
				$html .= '<div class="modal-content" bis_skin_checked="1">';
					$html .= '<div class="modal-header" bis_skin_checked="1">';
						$html .= '<h5 class="modal-title" id="exampleModalLongTitle">Image '.($data['key'] + 1).'</h5>';
						$html .= '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
							$html .= '<span aria-hidden="true">×</span>';
						$html .= ' </button>';
					$html .= '</div>';
					$html .= '<div class="modal-body text-center" bis_skin_checked="1">';
						$html .= '<div class="zoom-content zoom" bis_skin_checked="1" style="position: relative; overflow: hidden;">';
							$html .= '<img src="'.$data['imageUrl'].'" alt="" class="img-fluid" style="width:100% !important;height:100% !important">';
							 
						$html .= '</div>';
						
					$html .= '</div>';
				$html .= '</div>';
			$html .= '</div>';
		$html .= '</div>'; 
		
		
		return ['html' => $html];
	}
	
	/*
	 *----------------------------------------
	 * End: Get patient eye images template
	 * ---------------------------------------
	 */
	 
	 /*
	 *------------------------------
	 * Start: Medical Condition Lists
	 * -----------------------------
	 */
	 
	public static function getMedicalConditionLists()
	{
		return [
			['id' => 1,'name' => 'Type 1 Diabetes'],
			['id' => 2,'name' => 'Type 2 Diabetes'],
			 
		];
	}
	 
	 /*
	 *------------------------------
	 * End: Medical Condition Lists
	 * -----------------------------
	 */
	 
	 
	  /*
	 *--------------------------------
	 * Start: Medical Condition By Id
	 * -------------------------------
	 */
	 
	public static function getMedicalConditionById($id)
	{
		$medicalConditions = self::getMedicalConditionLists();
		foreach($medicalConditions as $condition){
			
			if($condition['id'] == $id){
				 
				return ['status' => 200,'medicalCondition' => $condition];
			}
		}
		
		return ['status' => 422];
	}
	 
	 /*
	 *------------------------------
	 * End: Medical Condition By Id
	 * -----------------------------
	 */


	/*
	 *------------------------------
	 * Start: Medical History Lists
	 * -----------------------------
	 */
	 
	public static function getMedicalHistoryLists()
	{
		return [
			 
			['id' => 1,'name' => 'Family History of Galucoma'],
			['id' => 2,'name' => 'HgbA1C'],
			['id' => 3,'name' => 'High Cholesterol'],
			['id' => 4,'name' => 'Hypertension'],
			['id' => 5,'name' => 'Obesity'],
			['id' => 6,'name' => 'Kidney Disease'],
			['id' => 7,'name' => 'Stroke'],
			['id' => 8,'name' => 'Coronary Artery Disease'],
			['id' => 9,'name' => 'Previous Myocardial Infection'],
		];
	}
	 
	 /*
	 *------------------------------
	 * End: Medical History Lists
	 * -----------------------------
	 */
	 
	 /*
	 *------------------------------
	 * Start: Medical History by id
	 * -----------------------------
	 */
	 
	public static function getMedicalHistoryById($ids)
	{
		// Ensure $ids is an array; if it's a string, split it into an array
		$ids = json_decode($ids,true);
 
		// Convert all IDs to integers for correct comparison
		$ids = array_map('intval', $ids);

		$medicalHistoryLists = self::getMedicalHistoryLists();

		// Filter medical history based on provided IDs
		$filteredHistory = array_filter($medicalHistoryLists, fn($history) => in_array($history['id'], $ids, true));

		return ['medical_history' => array_values($filteredHistory)];
	}
 
	/*
	 *------------------------------
	 * End: Medical History by id
	 * -----------------------------
	 */
	 
	 
	 /*
	 *------------------------------
	 * Start: Exam Type Lists
	 * -----------------------------
	 */
	 
	public static function getExamTypeLists($medicalConditionId)
	{
		$leftEye = [];
		$rightEye = [];
		if($medicalConditionId == 1){
			$leftEye = [
				['id' => 1,  'code' => 'E10.9',     'name' => 'No diabetic retinopathy'],
                ['id' => 2,  'code' => 'E10.3292',  'name' => 'NPDR Mild/Minimal'],
                ['id' => 3,  'code' => 'E10.3212',  'name' => 'NPDR Mild/Minimal with CSME'],
                ['id' => 4,  'code' => 'E10.3392',  'name' => 'NPDR Moderate'],
                ['id' => 5,  'code' => 'E10.3312',  'name' => 'NPDR Moderate with CSME'],
                ['id' => 6,  'code' => 'E10.349',   'name' => 'NPDR Severe'],
                ['id' => 7,  'code' => 'E10.341',   'name' => 'NPDR Severe with CSME'],
                ['id' => 8,  'code' => 'E10.3592',  'name' => 'PDR'],
                ['id' => 9,  'code' => 'E10.3512',  'name' => 'PDR with CSME'],
                ['id' => 10, 'code' => 'H35.3121',  'name' => 'AMD Grade 1, Dry'],
                ['id' => 11, 'code' => 'H35.312x',  'name' => 'AMD Grade 2, Drusen, Degenerative'],
                ['id' => 12, 'code' => 'H35.4x',    'name' => 'AMD Grade 3, Degeneration, Retinal, Secondary Pigmentary'],
                ['id' => 13, 'code' => 'H35.32',    'name' => 'AMD Grade 4, Exudative'],
                ['id' => 14, 'code' => 'H31.012',   'name' => 'AMD Grade 4, Chorioretinal scar, Posterior Pole'],
                ['id' => 15, 'code' => 'H31.102',   'name' => 'Drusen, Hereditary (extramacular drusen)'],
                ['id' => 16, 'code' => 'H35.89',    'name' => 'OTHER'],
                ['id' => 17, 'code' => 'H40.012',   'name' => 'Glaucoma: Optic nerve cupping'],
                ['id' => 18, 'code' => 'H57.89',    'name' => 'Image inadequate for assessment of retinal pathology'],
                ['id' => 19, 'code' => 'N/A',       'name' => 'This image is low quality and inadequate for interpretation.'],
				
			];
			
			$rightEye = [
				['id' => 1,  'code' => 'E10.9',     'name' => 'No diabetic retinopathy'],
                ['id' => 2,  'code' => 'E10.3291',  'name' => 'NPDR Mild/Minimal'],
                ['id' => 3,  'code' => 'E10.3211',  'name' => 'NPDR Mild/Minimal with CSME'],
                ['id' => 4,  'code' => 'E10.3391',  'name' => 'NPDR Moderate'],
                ['id' => 5,  'code' => 'E10.3311',  'name' => 'NPDR Moderate with CSME'],
                ['id' => 6,  'code' => 'E10.349',   'name' => 'NPDR Severe'],
                ['id' => 7,  'code' => 'E10.341',   'name' => 'NPDR Severe with CSME'],
                ['id' => 8,  'code' => 'E10.3591',  'name' => 'PDR'],
                ['id' => 9,  'code' => 'E10.3511',  'name' => 'PDR with CSME'],
                ['id' => 10, 'code' => 'H35.3111',  'name' => 'AMD Grade 1, Dry'],
                ['id' => 11, 'code' => 'H35.311x',  'name' => 'AMD Grade 2, Drusen, Degenerative'],
                ['id' => 12, 'code' => 'H35.4x',    'name' => 'AMD Grade 3, Degeneration, Retinal, Secondary Pigmentary'],
                ['id' => 13, 'code' => 'H35.32',    'name' => 'AMD Grade 4, Exudative'],
                ['id' => 14, 'code' => 'H31.011',   'name' => 'AMD Grade 4, Chorioretinal scar, Posterior Pole'],
                ['id' => 15, 'code' => 'H31.101',   'name' => 'Drusen, Hereditary (extramacular drusen)'],
                ['id' => 16, 'code' => 'H35.89',    'name' => 'OTHER'],
                ['id' => 17, 'code' => 'H40.011',   'name' => 'Glaucoma: Optic nerve cupping'],
                ['id' => 18, 'code' => 'H57.89',    'name' => 'Image inadequate for assessment of retinal pathology'],
                ['id' => 19, 'code' => 'N/A',       'name' => 'This image is low quality and inadequate for interpretation.'],
				
			];
		}
		
		if($medicalConditionId == 2){
			$leftEye = [
			
			    ['id' => 1,  'code' => 'E11.9',     'name' => 'No diabetic retinopathy'],
                ['id' => 2,  'code' => 'E11.3292',  'name' => 'NPDR Mild/Minimal'],
                ['id' => 3,  'code' => 'E11.3212',  'name' => 'NPDR Mild/Minimal with CSME'],
                ['id' => 4,  'code' => 'E11.3392',  'name' => 'NPDR Moderate'],
                ['id' => 5,  'code' => 'E11.3312',  'name' => 'NPDR Moderate with CSME'],
                ['id' => 6,  'code' => 'E11.349',   'name' => 'NPDR Severe'],
                ['id' => 7,  'code' => 'E11.341',   'name' => 'NPDR Severe with CSME'],
                ['id' => 8,  'code' => 'E11.3592',  'name' => 'PDR'],
                ['id' => 9,  'code' => 'E11.3512',  'name' => 'PDR with CSME'],
                ['id' => 10, 'code' => 'H35.3121',  'name' => 'AMD Grade 1, Dry'],
                ['id' => 11, 'code' => 'H35.31X',   'name' => 'AMD Grade 2, Drusen, Degenerative'],
                ['id' => 12, 'code' => 'H35.4X',    'name' => 'AMD Grade 3, Degeneration, Retinal, Secondary Pigmentary'],
                ['id' => 13, 'code' => 'H35.32',    'name' => 'AMD Grade 4, Exudative'],
                ['id' => 14, 'code' => 'H31.012',   'name' => 'AMD Grade 4, Chorioretinal scar, Posterior Pole'],
                ['id' => 15, 'code' => 'H31.102',   'name' => 'Drusen, Hereditary (extramacular drusen)'],
                ['id' => 16, 'code' => 'H35.89',    'name' => 'OTHER'],
                ['id' => 17, 'code' => 'H40.012',   'name' => 'Glaucoma: Optic nerve cupping'],
                ['id' => 18, 'code' => 'H57.89',    'name' => 'Image inadequate for assessment of retinal pathology'],
                ['id' => 19, 'code' => 'N/A',       'name' => 'This image is low quality and inadequate for interpretation.'],
				
			];
			
			$rightEye = [
				['id' => 1,  'code' => 'E11.9',     'name' => 'No diabetic retinopathy'],
                ['id' => 2,  'code' => 'E11.3291',  'name' => 'NPDR Mild/Minimal'],
                ['id' => 3,  'code' => 'E11.3211',  'name' => 'NPDR Mild/Minimal with CSME'],
                ['id' => 4,  'code' => 'E11.3391',  'name' => 'NPDR Moderate'],
                ['id' => 5,  'code' => 'E11.3311',  'name' => 'NPDR Moderate with CSME'],
                ['id' => 6,  'code' => 'E11.349',   'name' => 'NPDR Severe'],
                ['id' => 7,  'code' => 'E11.341',   'name' => 'NPDR Severe with CSME'],
                ['id' => 8,  'code' => 'E11.3591',  'name' => 'PDR'],
                ['id' => 9,  'code' => 'E11.3511',  'name' => 'PDR with CSME'],
                ['id' => 10, 'code' => 'H35.3111',  'name' => 'AMD Grade 1, Dry'],
                ['id' => 11, 'code' => 'H35.31X',   'name' => 'AMD Grade 2, Drusen, Degenerative'],
                ['id' => 12, 'code' => 'H35.4X',    'name' => 'AMD Grade 3, Degeneration, Retinal, Secondary Pigmentary'],
                ['id' => 13, 'code' => 'H35.32',    'name' => 'AMD Grade 4, Exudative'],
                ['id' => 14, 'code' => 'H31.011',   'name' => 'AMD Grade 4, Chorioretinal scar, Posterior Pole'],
                ['id' => 15, 'code' => 'H31.101',   'name' => 'Drusen, Hereditary (extramacular drusen)'],
                ['id' => 16, 'code' => 'H35.89',    'name' => 'OTHER'],
                ['id' => 17, 'code' => 'H40.011',   'name' => 'Glaucoma: Optic nerve cupping'],
                ['id' => 18, 'code' => 'H57.89',    'name' => 'Image inadequate for assessment of retinal pathology'],
                ['id' => 19, 'code' => 'N/A',       'name' => 'This image is low quality and inadequate for interpretation.'],
				
			];
		}
		
		
		return ['leftEye' => $leftEye,'rightEye' => $rightEye];
	}
	 
	 /*
	 *------------------------------
	 * End: Exam Type Lists
	 * -----------------------------
	 */
	 
	 /*
	 *------------------------------
	 * Start: Exam Type by id
	 * -----------------------------
	 */
	 
	public static function getExamTypeById($medicalConditionId, $id, $eye)
	{
		$medicalExamTypeLists = self::getExamTypeLists($medicalConditionId);
 
		// If eye is specified, only check that eye
		if ($eye && isset($medicalExamTypeLists[$eye])) {
			
			foreach ($medicalExamTypeLists[$eye] as $examType) {
			 
				if ($examType['id'] == $id) {
					return [
						'status' => 200,
						'examType' => $examType,
						'eye' => $eye
					];
				}
			}
		}  

		return ['status' => 422, 'examType' => null];
	}
 
	/*
	 *------------------------------
	 * End: Exam Type by id
	 * -----------------------------
	 */
	  
 
	/*
	 *-----------------------------------
	 * Start: Generate username from name
	 * ----------------------------------
	 */
	public static function genUserName($str)
	{
		  $firstChar =  explode(' ',trim($str));
		  $username = mt_rand(1111,9999).''.substr(microtime(true), -2);
		  if(isset($firstChar[0])){
			  $username = $firstChar[0].''.mt_rand(1111,9999).''.substr(microtime(true), -2);
		  }
		  return ['username' => strtolower($username)];
	}
 
 	 /*
	 *---------------------------------
	 * End: Generate username from name
	 * --------------------------------
	 */

	 /*
	 *---------------------------------
	 * Start: Get Prefix
	 * --------------------------------
	 */
	public static function prefix($id)
	{
		$role = self::roleById($id);
		 
		if($role['status'] == 200){
			if($role['role']['id'] != 1){
				
				return ['prefix' => ''];
			}else{
				return ['prefix' => $role['role']['slug']];
			}
			
		}
		return ['prefix' => NULL];
	}

	/*
	 *---------------------------------
	 * End: Prefix
	 * --------------------------------
	 */

	/*
	 *---------------------------------
	 * Start: Guest Prefix
	 * --------------------------------
	 */
	public static function getGuestprefix()
    {
        $localServer = array("localhost", "127.0.0.1");
        $host = request()->getHost(); // Get the current host (domain)

        if (in_array($host, $localServer)) {
		 
            return ['prefix' => request()->segment(1)];// If it's a local server, get the first URL segment
        } else {
			 
            // For live, extract the segment 
            return ['prefix' => request()->segment(1)]; // This assumes the prefix is the first subdomain
            
        }
    }
	/*
	 *---------------------------------
	 * End: Guest Prefix
	 * --------------------------------
	 */
	 
	
	/**
     * Get token expiration datetime (1 day from now).
     * @return array
     */
    public static function tokensExpireIn()
    {
        return ['token_expire_in' => Carbon::now()->addDay()];

    }
	  
	/*
	 *---------------------------------
	 * Start: Get user status
	 * --------------------------------
	 */
	public static function userStatus()
	{
		return [
			['id' => 0,'name' => 'inactive','class' => 'danger'],
			['id' => 1,'name' => 'active','class' => 'success']
		];
	}

	/*
	 *---------------------------------
	 * End: Get user status
	 * --------------------------------
	 */

	 /*
	 *---------------------------------
	 * Start: Get user status by id
	 * --------------------------------
	 */

	public static function getUserStatusById($id)
	{
		$statuses = self::userStatus();
		
		foreach ($statuses as $status) {
			if ($status['id'] == $id) {
				return ['status' => 200,'uStatus' => $status];
			}
		}
		
		return ['status' => 422];
	}

	/*
	 *---------------------------------
	 * End: Get user status by id
	 * --------------------------------
	 */

	 

	 /*
	 *---------------------------------
	 * Start: Get clinic status
	 * --------------------------------
	 */
	public static function clinicStatus()
	{
		return [
			['id' => 0,'name' => 'inactive','class' => 'danger'],
			['id' => 1,'name' => 'active','class' => 'success']
		];
	}

	/*
	 *---------------------------------
	 * End: Get clinic status
	 * --------------------------------
	 */

	/*
	 *---------------------------------
	 * Start: Get clinic status by id
	 * --------------------------------
	 */

	public static function getClinicStatusById($id)
	{
		$statuses = self::clinicStatus();
	
		foreach ($statuses as $status) {
		       
			if ($status['id'] == $id) {
			  
				return ['status' => 200,'cStatus' => $status];
			}
		}
	 
		return ['status' => 422];
	}

	/*
	 *---------------------------------
	 * End: Get clinic status by id
	 * --------------------------------
	 */
	 
	 /*
	 *---------------------------------
	 * Start: Get patient remark status
	 * --------------------------------
	 */
	public static function patientRemarkStatus()
	{
		return [
			['id' => 0,'name' => 'pending','class' => 'danger'],
			['id' => 1,'name' => 'seen','class' => 'success']
		];
	}
	
	 /*
	 *---------------------------------
	 * End: Get patient remark status
	 * --------------------------------
	 */
	 
	 
	 /*
	 *---------------------------------
	 * Start: Get patient remark status by id
	 * --------------------------------
	 */

	public static function getPatientRemarkStatusById($id)
	{
		$statuses = self::patientRemarkStatus();
		
		foreach ($statuses as $status) {
			if ($status['id'] == $id) {
				return ['status' => 200,'pStatus' => $status];
			}
		}
		
		return ['status' => 422];
	}

	/*
	 *---------------------------------
	 * End: Get patient remark status by id
	 * --------------------------------
	 */
	
	 
	 
	 /*
	 *---------------------------------
	 * Start: Get patient diagnosis status
	 * --------------------------------
	 */
	public static function patientDiagnosisStatus()
	{
		return [
			['id' => 0,'name' => 'pending','class' => 'danger'],
			['id' => 1,'name' => 'completed','class' => 'success']
		];
	}

	
	
	/*
	 *----------------------------------
	 * End: Get patient diagnosis status
	 * ---------------------------------
	 */
	 
	 
	 /*
	 *-----------------------------------------
	 * Start: Get patient diagnosis status by id
	 * -----------------------------------------
	 */

	public static function getPatientDiagnosisStatusById($id)
	{
		$statuses = self::patientDiagnosisStatus();
		
		foreach ($statuses as $status) {
			if ($status['id'] == $id) {
				return ['status' => 200,'pStatus' => $status];
			}
		}
		
		return ['status' => 422];
	}

	/*
	 *----------------------------------------
	 * End: Get patient diagnosis status by id
	 * ---------------------------------------
	 */


	/*
	 *------------------------------
	 * Start: Get genders
	 * -----------------------------
	 */
	public static function getGenders()
	{
		return [
			['id' => 1,'name' => 'male'],
			['id' => 2,'name' => 'female']
		];
	}

	 /*
	 *------------------------------
	 * Start: Get genders
	 * -----------------------------
	 */
	 
	 

	 /*
	 *---------------------------------
	 * Start: Get gender by id
	 * --------------------------------
	 */

	public static function getGenderById($id)
	{
		$genders = self::getGenders();
		
		foreach ($genders as $gender) {
			if ($gender['id'] == $id) { 
				return ['status' => 200,'gender' => $gender];
			}
		}
		
		return ['status' => 422,'gender' => NULL];
	}

	/*
	 *---------------------------------
	 * End: Get gender by id
	 * --------------------------------
	 */
	 
	 
	/*
	 *---------------------------------
	 * Start: Gen user code  
	 * --------------------------------
	 */
	public static function genUserCode($roleId)
	{
		$query = User::where('role_id',$roleId);
		$count = $query->count(); 
		 
		$code = NULL;
		 
		if($roleId == 2){
			$code = 'ODR';
		}
		if($roleId == 3){
			$code = 'DR';
		}
		if($roleId == 4){
			$code = 'MA';
		}
		if($roleId == 5){
			$code = 'OT';
		}
		if($roleId == 6){
			$code = 'CA';
		}
		  
		$newCount = ($count + 1);
		// Generate the user code, ensuring the number is zero-padded
		$userCode = $code.'-' . str_pad($newCount, 3, '0', STR_PAD_LEFT);
		return ['code' => $userCode];
	}
	 /*
	 *---------------------------------
	 * End: Gen user code  
	 * --------------------------------
	 */

	 /*
	 *---------------------------------
	 * Start: Gen clinic code  
	 * --------------------------------
	 */
	public static function genClinicCode()
	{
		$count = Clinic::count(); 
		$newCount = ($count + 1);
		// Generate the clinic code, ensuring the number is zero-padded
		$clinicCode = 'CLI-' . str_pad($newCount, 3, '0', STR_PAD_LEFT);
		return ['code' => $clinicCode];
	}
	 /*
	 *---------------------------------
	 * End: Gen clinic code  
	 * --------------------------------
	 */
	 
	  /*
	 *---------------------------------
	 * Start: Gen patient code  
	 * --------------------------------
	 */
	public static function genPatientCode()
	{
		$count = Patient::count(); 
		$newCount = ($count + 1);
		// Generate the clinic code, ensuring the number is zero-padded
		$patientCode = 'PT-' . str_pad($newCount, 3, '0', STR_PAD_LEFT);
		return ['code' => $patientCode];
	}
	 /*
	 *---------------------------------
	 * End: Gen patient code  
	 * --------------------------------
	 */


	 /*
	 *-----------------------------------
	 * Start: Generate Slug
	 * ----------------------------------
	 */
	public static function genSlug($str)
	{
		 // Convert the string to lowercase
		$slug = strtolower($str);

		// Replace spaces with hyphens
		$slug = preg_replace('/\s+/', '-', $slug);
		
		// Remove any non-alphanumeric characters, except for hyphens
		$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
		
		// Trim any leading or trailing hyphens
		$slug = trim($slug, '-');
	 
		return ['slug' => $slug];
	}
 
 	 /*
	 *---------------------------------
	 * End: Generate Slug
	 * --------------------------------
	 */

	/*
	 *---------------------------------------
	 * Start: Google Api Key
	 * -------------------------------------
	 */
	public static function googleApiKey()
	{
		return ['key' => 'AIzaSyCtg6oeRPEkRL9_CE-us3QdvXjupbgG14A'];
	}
	 /*
	 *---------------------------------------
	 * End: Google Api Key
	 * -------------------------------------
	 */


	/*
	 *---------------------------------------
	 * Start: Get lat and long  from address
	 * -------------------------------------
	 */
	public static function getLatLng($address)
	{
		$key = self::googleApiKey()['key'];
		$geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=".$key;
        $response = file_get_contents($geocodeUrl);
        $data = json_decode($response);
		$input['latitude'] = NULL;
		$input['longitude'] = NULL;
        if ($data->status == 'OK') {
            $input['latitude'] = $data->results[0]->geometry->location->lat;
            $input['longitude'] = $data->results[0]->geometry->location->lng;
        }
		return ['response' => $input];
	}

	 /*
	 *---------------------------------------
	 * End: Get lat and long  from address
	 * -------------------------------------
	 */


	 /*
	 *---------------------------------------
	 * Start: Get clinics
	 * -------------------------------------
	 */
	public static function getClinics($isAdmin = true,$filters = [])
	{  
		$query = Clinic::with('clinicPatients','clinicUsers')->orderBy('id','DESC');  
		if($isAdmin == false){
			$query->whereHas('clinicUsers',function($q){
				$q->where('user_id',\Auth::user()->id);
			});
			//$query->where('status',1);
			
		} 
		
		if(isset($filters['status'])){
			$query->where('status',$filters['status']);
		}
		
		if(\Auth::user()->role_id != 1){
			$query->whereIn('id',\Auth::user()->clinicUsers->pluck('clinic_id'));
		}
		
		if(isset($filters['paginate']) && $filters['paginate'] == false){
			
			$clinics = $query->get();
			 
		}else{
			
			$clinics = $query->paginate();
		}
		
		
		return ['clinics' => $clinics];
	} 
	 /*
	 *---------------------------------------
	 * End: Get clinics
	 * -------------------------------------
	 */

	/*
	 *---------------------------------------
	 * Start: Get clinic by id
	 * -------------------------------------
	 */
	public static function getClinicById($id)
	{
		$clinic = Clinic::with('clinicUsers','clinicUsers.user','additionalSetting')->find($id);
		return ['clinic' => $clinic];
	} 
	 /*
	 *---------------------------------------
	 * End: Get clinic by id
	 * -------------------------------------
	 */
	
/*
	 *---------------------------------------
	 * Start: Get clinic image
	 * -------------------------------------
	 */
	public static function getClinicImage($id)
	{
		$clinic = Clinic::find($id);
	
		if (!$clinic || !$clinic->image) {
			return ['status' => 422];
		}
		$imagePath = asset('uploads/clinic_logos/' . $clinic->id . '/' . $clinic->image);
		$relativePath = 'uploads/clinic_logos/' . $clinic->id . '/' . $clinic->image;

		 $fullPath = public_path($relativePath);
		return ['status' => 200,'image' => $imagePath,'name' => $clinic->image, 'path' => $fullPath ];
	}
	
	 /*
	 *---------------------------------------
	 * End: Get clinic image
	 * -------------------------------------
	 */

	/*
	 *---------------------------------------
	 * Start: Show Files
	 * -------------------------------------
	 */
	public static function showFiles($id,$files,$folder,$slug,$model,$actionBtn = true)
	{  
		$html = "<div class='mb-3'><b>Please find below the uploaded files:-</b></div>";
		$html .= "<ul><li>No file found</li></ul>";
		if(!\Auth::check()){
			return ['status' => 422, 'html' => $html];
		}
		 
		if( !empty($files) ){
			$html = "<div class='mb-3'><b>Please find below the uploaded files:-</b></div>";
			$html .= "<ul>";
			 
			if(!empty($files) && count(array_filter($files)) > 0){
				foreach($files as $file){
					$dir = public_path('uploads/'.$folder.'/').'/'.$slug.'/'.$file;
					if(!empty($file) && file_exists($dir)){
						$html .= "<li><a target='_blank' href=".url('public/uploads/'.$folder.'/').'/'.$slug.'/'.$file.">".$file."</a>";
						if($actionBtn == true){
							$html .= " <a href='javascript:void(0);' class='text-danger' onClick=\"delFile('" . $id . "','" . $file . "','" . $model . "','" . $folder . "')\"><i class='fa fa-trash-o fa-lg'></i></a></li>";
						}
						
					}
				}
			}else{
				$html .= "<li class='text-muted'>No file found</li>";
			}
			$html .= "</ul>";
			return ['status' => 200, 'html' => $html];
		}
		 
		return ['status' => 422, 'html' => $html];
		
	} 
	 /*
	 *---------------------------------------
	 * End: Show Files
	 * -------------------------------------
	 */

	/*
	 *---------------------------------------
	 * Start: Delete File
	 * -------------------------------------
	 */
	public static function delFile($data)
	{
		$model = ucwords($data['model']);
		$class = "\App\\Models\\" . $model;
		$record = $class::find($data['id']); 
		if(!$record){
			return ['status' => 422];
		}
	 
		if($model == 'User'){
			$dir = public_path('uploads/'.$data['folder'].'/').'/'.$record['user_name'].'/'.$data['file'];
			if(!empty($data['file']) && file_exists($dir)){
				unlink($dir);
				$record->image = NULL;
				$record->save();

				return ['status' => 200, 'message' => 'Image deleted successfully'];
			}
		}elseif($model == 'Clinic'){
 
			$dir = public_path('uploads/'.$data['folder'].'/').'/'.$record['slug'].'/'.$data['file'];
			if(!empty($data['file']) && file_exists($dir)){
				
				$files = json_decode($record->files,true);
				if (is_array($files)) {
					// Search for and remove the file from the array
					$fileKey = array_search($data['file'], $files);
					if ($fileKey !== false) {
						unset($files[$fileKey]);
			
						// Update the record's files attribute
						$record->files = json_encode(array_values($files)); // Reindex the array
						$record->save();
			
						// Optionally delete the file from the server
						unlink($dir);
			
						return ['status' => 200, 'message' => 'File deleted successfully'];
					}
				}
			}

			return ['status' => 200];
		}

	}

	 /*
	 *---------------------------------------
	 * End: Delete Files
	 * -------------------------------------
	 */


	 /*
	 *---------------------------------------
	 * Start: Get clinic users
	 * -------------------------------------
	 */
	public static function getClinicUsers($isAdmin = true,$filters = [])
	{  
		$query = ClinicUser::with('user','clinic')->orderBy('id','DESC');  
		  
		if(isset($filters['paginate']) && $filters['paginate'] == false){
			
			$clinicUsers = $query->get();
			 
		}else{
			
			$clinicUsers = $query->paginate();
		}
		
		
		return ['clinicUsers' => $clinicUsers];
	} 
	 /*
	 *---------------------------------------
	 * End: Get clinics users
	 * -------------------------------------
	 */
	 
	  /*
	 *---------------------------------------
	 * Start: Get clinic user by id
	 * -------------------------------------
	 */
	public static function getClinicUserById($id)
	{  
		$clinicUser = ClinicUser::find($id);  
		return ['clinicUser' => $clinicUser];
	} 
	 /*
	 *---------------------------------------
	 * End: Get clinics users
	 * -------------------------------------
	 */


	  /*
	 *---------------------------------------
	 * Start: Check Clinic has User 
	 * -------------------------------------
	 */
	public static function clinicHasAdmin($clinicIds,$userId = NULL,$roleId = NULL)
	{
		$data['hasAdmin'] = false;
		  
		$message = '';
		 	 
		foreach($clinicIds as $cId){ 
				
			$query = ClinicUser::where('clinic_id',$cId)
			->where('is_admin',1);
			if(!empty($userId)){
				$query->where('user_id','!=',$userId);
				  
			}
			 
			$clinicAdmin = $query->first();
			if($clinicAdmin){
				if($roleId == 6){
					$data['hasAdmin'] = true;
					$data['message'][] = 'An admin for '.$clinicAdmin->clinic->name.' already exists.';
				}
			}
			//$clinic = self::getClinicById($cId)['clinic'];
			// $clinicUserIds = $query->pluck('user_id')->toArray();
			// foreach($clinicUserIds as $uId){
				// $user = User::find($uId);
					
				// if($user->role_id == 6 && $roleId == 6){
					// $data['hasAdmin'] = true;
					// $data['message'][] = 'An admin for '.$clinic->name.' already exists.';
				// }
				 	
			// }
				
			
		}   
		
		$message = '<ol class="px-3">';
		if(!empty($data['message'])){
			foreach($data['message'] as $msg){
				$message .= '<li>'.$msg.'</li>';
			}
		}
		
		$message .= '</ol>';
			 
		//$message .= '<p>If you wish to create a new one, please remove the existing admin first.</p>';
 		$data['message'] = $message;
		 
		return ['hasAdminRsp' => $data];
	}
	  /*
	 *---------------------------------------
	 * End: Check Clinic has User 
	 * -------------------------------------
	 */
	 
	 
	 
	 /**
	 * Process uploaded images: detect if base64, then convert, otherwise return as is.
	 */
	public static function processImages($images)
	{
		$files = [];
		
		foreach ($images as $image) {
			 
			if (self::isBase64Image($image)) {
				
				$files[] = self::convertBase64ToFile($image);
				
			}elseif (self::isUrl($image)) {
			 
				$files[] = self::convertUrlToFile($image);
			}elseif (self::isBlobUrl($image)) { // Check if it's a Blob URL
				//$files[] = self::convertUrlToFile($image); // Handle Blob conversion

			}else{
				 
				$files[] = $image;
			}  
		}

		return $files;
	}
	
	public static function  isBlobUrl($url) {
		return str_starts_with($url, "blob:");
	}
	 

	/**
	 * Check if the given string is a valid file path
	 */
	public static function isUrl($url)
	{
		return filter_var($url, FILTER_VALIDATE_URL);
	}
	/**
	 * Convert a file path to an UploadedFile object
	 */
	public static function convertUrlToFile($url)
	{  
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_VERBOSE, false); // Enable debugging output
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);


		$fileContents = curl_exec($ch);
		  
		if (curl_errno($ch)) {
			echo "cURL Error: " . curl_error($ch);
			curl_close($ch);
			return null;
		}

		curl_close($ch);

		if (!$fileContents) {
			echo "Empty response received!";
			return null;
		}

		$extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'png';
		$tmpFilePath = sys_get_temp_dir() . '/' . uniqid() . '.' . $extension;
		file_put_contents($tmpFilePath, $fileContents);

		return new UploadedFile($tmpFilePath, basename($tmpFilePath), mime_content_type($tmpFilePath), null, true);
	}

	/**
	 * Check if the given string is a base64-encoded image
	 */
	public static function isBase64Image($data)
	{
		return is_string($data) && preg_match('/^data:image\/[a-zA-Z]+;base64,/', $data);
	}

	/**
	 * Convert a single base64 image to an UploadedFile object
	 */
	public static function convertBase64ToFile($image)
	{
		preg_match('/^data:image\/(\w+);base64,/', $image, $matches);
		$extension = $matches[1] ?? 'png'; // Default to PNG if extension not found
		$base64Data = substr($image, strpos($image, ',') + 1);

		$binaryData = base64_decode($base64Data);
		$tmpFilePath = sys_get_temp_dir() . '/' . uniqid() . '.' . $extension;
		file_put_contents($tmpFilePath, $binaryData);

		return new UploadedFile($tmpFilePath, 'image.' . $extension, mime_content_type($tmpFilePath), null, true);
	}
	
	/**
	 * Date Format
	 */
	public static function dateFormat($date,$format = 'm-d-Y')
	{
		return ['date' => \Carbon\Carbon::parse($date)->format($format)];
	}
	
	/**
	 * check Eye Status
	 */
	public static function checkEyeStatus($status)
	{
		$status = !empty($status) ? 'Yes' : 'No';
		return ['status' => $status ];
	}
	
	/*
	 *---------------------------------------
	 * Start: Get Countries
	 * -------------------------------------
	 */
	public static function getCountries($filters = [])
	{
		$query = Country::orderBy('id','ASC');
		$countries =  $query->get();
		return ['countries' => $countries];
	}
	/*
	 *---------------------------------------
	 * End: Get Countries
	 * -------------------------------------
	 */
	 
	 
	 /*
	 *---------------------------------------
	 * Start: Get Country by id
	 * -------------------------------------
	 */
	public static function getCountryById($id)
	{
		$countries = self::getCountries()['countries'];
		 
		foreach ($countries as $country) {
			if ($country['id'] == $id) { 
				return ['status' => 200,'country' => $country];
			}
		}
		return ['status' => 422];
	}
	/*
	 *---------------------------------------
	 * End: Get Country by id
	 * -------------------------------------
	 */
	
	/*
	 *---------------------------------------
	 * Start: Get States
	 * -------------------------------------
	 */
	public static function getStates($filters = [])
	{
		$query = State::orderBy('id','ASC');
		if(!empty($filters['country_id'])){
			$query->where('country_id',$filters['country_id']);
		}
		$states =  $query->get();
		return ['states' => $states];
	}
	/*
	 *---------------------------------------
	 * End: Get States
	 * -------------------------------------
	 */
	 
	 
	 /*
	 *---------------------------------------
	 * Start: Get State by id
	 * -------------------------------------
	 */
	public static function getStateById($id)
	{
		$states = self::getStates()['states'];
		 
		foreach ($states as $state) {
			if ($state['id'] == $id) { 
				return ['status' => 200,'state' => $state];
			}
		}
		return ['status' => 422];
	}
	/*
	 *---------------------------------------
	 * End: Get State by id
	 * -------------------------------------
	 */
	 
	/********* Start:All modules listing **************/
	public static function roleModules()
	{
		return [
			1 => 'Clinics',
			2 => 'Patients',
			3 => 'Users',
			4 => 'Staff',
			5 => 'Remark',
			6 => 'Reports',
			7 => 'PDF Template',
			 
		];
	}
	/********* End:All modules listing **************/
	
	/********* Start:Check role permission **************/ 
	public static function permission($moduleId,$field)
	{ 
		if( !\Auth::user() ){
			return false;
		}
		if( \Auth::user()->hasRole('super-admin')){
			return true;
		}else{
			
			$haveAccess = Permission::where('module_id',$moduleId)
			->where($field,1)
			->where('role_id',\Auth::user()->role_id)
			->first();
			 
			if($haveAccess){
				return true;
			}
		}
		
		return false;
	}
	/********* End:Check role permission **************/
	
	
	/********* Start:Check the Orvos Doctor Licence Number Expire or not **************/
	public static function chkOrvosDocLicenceHasExp($id,$data = [])
	{ 
		$user = self::getUserById($id)['user'];
		$message = "Access to future features is restricted. Your license has expired.";
		if (!$user) {
			return ['status' => true ,'message' => $message];
		}
		if(empty($data['state_id'])){
			return ['status' => true ,'message' => $message];
		}
		
		$expDate = $user->licenses()->where('l_state_id', $data['state_id'])->value('expiry_date');
		$orv = \Carbon\Carbon::parse($expDate);
		$current = \Carbon\Carbon::today();
	 
		if ($orv->timestamp <= $current->timestamp) {
			 
			return ['status' => true,'message' => $message];
			
		}  
		 
		return ['status' => false ,'message' => ''];
	}
	/********* End:Check the Orvos Doctor Licence Expire or not **************/
	
	
	/********* Start:Generate Signed URL **************/
	public static function genSignedUrl($id, $data = [], $route, $isExpiry = false)
	{
		// Encode ID safely for URL
		$safeId = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($id));

		if ($isExpiry) {
			// Temporary signed URL with 3 days expiry (4320 minutes)
			$signedRoute = \URL::temporarySignedRoute(
				$route,
				now('UTC')->addMinutes(4320),
				array_merge(['id' => $safeId], $data)
			);
		} else {
			// Permanent signed URL (no expiry)
			$signedRoute = \URL::signedRoute(
				$route,
				array_merge(['id' => $safeId], $data)
			);
		}

		return ['signedRoute' => $signedRoute];
	}
	
	/********* End:Generate Signed URL **************/

	public static function changeDateFormat($date)
	{
		if(empty($date)){
			return['date' => $date];
		} 
		$newDate = \Carbon\Carbon::createFromFormat('m-d-Y', $date)->format('Y-m-d');
		return['date' => $newDate];
	}


	 /*
	 *---------------------------------
	 * Start: Get Follow Up status
	 * --------------------------------
	 */
	public static function followupStatus()
	{
		return [
			['id' => 1,'name' => '6-Mths','class' => 'warning text-white'],
			['id' => 2,'name' => '12-Mths','class' => 'light'],
			['id' => 3,'name' => 'Urgent','class' => 'danger'],
			['id' => 4,'name' => 'Schedule Dr Visit','class' => 'success']
		];
	}

	
	
	/*
	 *----------------------------------
	 * End: Get Follow Up status
	 * ---------------------------------
	 */
	 
	 
	 /*
	 *-----------------------------------------
	 * Start: Get Follow Up status by id
	 * -----------------------------------------
	 */

	public static function getFollowUpStatusById($id)
	{
		$statuses = self::followupStatus();
		
		foreach ($statuses as $status) {
			if ($status['id'] == $id) {
				return ['status' => 200,'fStatus' => $status];
			}
		}
		
		return ['status' => 422];
	}

	/*
	 *----------------------------------------
	 * End: Get Follow Up status by id
	 * ---------------------------------------
	 */
	 
	 
	 /*
	 *-----------------------------------------
	 * Start: PDF Templates Categories
	 * -----------------------------------------
	 */
	 
	public static function getPdfTempCategories()
	{
		$logo = Url('public/uploads/editor/1757501387_OrvosTransparentLogo1.png').'?convertToServerPath=1758591159_Orvos_med.png';
		$pdfTempCategories = [
		
			['id' => 1,'name' => 'Patient Diagnosis Report','template' => '<pre style="text-align:center;"><img src="'.$logo.'" style="width: 300px;" class="fr-fic fr-dib"></pre>
<hr>

<p><span style="font-size: 18px;" data-pasted="true"><strong><span style="font-family: Arial,Helvetica,sans-serif;">EHR:</span></strong><span style="font-family: Arial,Helvetica,sans-serif;"> {Patient:EHR}</span></span><span style="font-family: Arial,Helvetica,sans-serif;"><br></span><span style="font-size: 24px; font-family: Arial, Helvetica, sans-serif;"><strong>Patient Name:</strong> {Patient:FirstName} {Patient:LastName}</span></p><pre><span style="font-size: 12px;"><span data-pasted="true"><strong><span style="font-family: Arial, Helvetica, sans-serif;">Patient DOB:</span></strong></span><span data-pasted="true"><span style="font-family: Arial, Helvetica, sans-serif;"> {Patient:DOB}</span></span></span><span style="font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
</span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Patient Gender:</strong> {Patient:Gender}</span><span style="font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
</span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Patient Condition</strong>: </span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;" data-pasted="true">({Patient:MedicalCondition})</span><span style="font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
</span><span style="font-size: 12px;"><span style="font-family: Arial, Helvetica, sans-serif;" data-pasted="true"><strong>Patient History:</strong> {Patient:History}</span></span><span style="font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
</span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Patient Notes:</strong> {Patient:Notes}</span></pre>
<hr>

<table style="width: 100%; border-collapse: collapse; border-width: 0px; border-style: solid; float: left; border-color: rgb(255, 255, 255); height: 64px;" border="1">
	<tbody>
		<tr style="height: 63px;">
			<td data-cell-padding="10px" style="padding: 10px; width: 50%; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;" data-cell-width="50%"><pre><span style="font-size: 12px;"><strong><span style="font-family: Arial,Helvetica,sans-serif;">Left Eye:</span></strong><span style="font-family: Arial,Helvetica,sans-serif;"> 
{Patient:LeftEyeImages}</span></span></pre></td>
			<td data-cell-padding="10px" style="padding: 10px; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;"><pre><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Right Eye:</strong>  
{Patient:RightEyeImages}</span></pre></td>
		</tr>
		<tr>
			<td style="padding: 10px; width: 50%; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;"><pre style="text-align: left;" data-pasted="true"><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Left Eye Diagnosis Details:</strong>
{Patient:LeftEyeRemarks}</span></pre></td>
			<td style="padding: 10px; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;"><pre style="text-align: left;" data-pasted="true"><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Right Eye Diagnosis Details:</strong>
{Patient:RightEyeRemarks}</span></pre></td>
		</tr>
	</tbody>
</table><pre data-pasted="true"><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Diagnosis Notes:</strong></span><span style="font-family: Arial,Helvetica,sans-serif;">
</span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;">{Patient:DiagnosisNote}</span><span style="font-family: Arial,Helvetica,sans-serif;">
</span>
<span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Follow Up:</strong></span><span style="font-family: Arial,Helvetica,sans-serif;">
</span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;">{Patient:FollowUp}</span></pre>

<p><span style="font-family: Arial,Helvetica,sans-serif;"><br></span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;"><strong>Orvos Doctor&nbsp;</strong></span><span style="font-size: 12px;"><span style="font-family: Arial,Helvetica,sans-serif;"><strong>:</strong> </span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;" data-pasted="true">{OrvosDoctor:Name}</span></span><span style="font-family: Arial,Helvetica,sans-serif;"><br></span><span style="font-size: 12px;"><span style="font-family: Arial,Helvetica,sans-serif;"><strong>NPI Number:&nbsp;</strong></span><span style="font-size: 12px; font-family: Arial, Helvetica, sans-serif;" data-pasted="true">{OrvosDoctor:NPINumber}</span></span></p>

<p>
	<br>
</p>

<p style="text-align: right;"><img src="'.$logo.'"  style="width: 224px;" class="fr-fic fr-dib fr-fir"></p>
 

		'],
		]; 
		
		return ['pdfTempCategories' => $pdfTempCategories];
	}
	 
	 
	  /*
	 *-----------------------------------------
	 * End: PDF Templates Categories
	 * -----------------------------------------
	 */
	 
	 
	  /*
	 *-----------------------------------------
	 * Start: PDF Templates Category By Id
	 * -----------------------------------------
	 */
	 
	public static function getPdfTempCategoryById($id)
	{
		$pdfTempCategories = self::getPdfTempCategories()['pdfTempCategories'];
		 
		foreach ($pdfTempCategories as $category) {
			if ($category['id'] == $id) {
				return ['status' => 200,'pdfTempCategory' => $category];
			}
		}
		
		return ['status' => 422];
	}
	 
	 
	  /*
	 *-----------------------------------------
	 * End: PDF Templates Category By Id
	 * -----------------------------------------
	 */

	/*
	 *-----------------------------------------
	 * Start: PDF Templates
	 * -----------------------------------------
	 */
	public static function getPdfTemplates($filters = []) 
	{
		$query = PdfTemplate::orderBy('id','DESC');

		if(isset($filters['status'])){
			$query->where('status',$filters['status']);
		}
		 
		//$query->where('user_id',\Auth::user()->id);
		$query->whereIn('clinic_id',\Auth::user()->clinicUsers->pluck('clinic_id'));
		 
		
		$pdfTemplates = $query->paginate();
		
		return ['pdfTemplates' => $pdfTemplates];
	}
	 
	/*
	 *-----------------------------------------
	 * End: PDF Templates
	 * -----------------------------------------
	 */
	
	
	/*
	 *-----------------------------------------
	 * Start: PDF Template by id
	 * -----------------------------------------
	 */
	 
	public static function getPdfTemplateById($id) 
	{
		$pdfTemplate = PdfTemplate::find($id);
		return ['pdfTemplate' => $pdfTemplate];
	}
	/*
	 *-----------------------------------------
	 * End: PDF Template by id
	 * -----------------------------------------
	 */
	 
	 
	/*
	 *-----------------------------------------------
	 * Start: Get the PDF Template accroding to clinic
	 * ----------------------------------------------
	 */
	public static function getPdfTemplateByClinicId($clinicId,$pdfTemplateCategoryId,$moduleData)
	{
		$pdfTemplate = PdfTemplate::where('clinic_id', $clinicId)
		->where('pdf_template_category_id',$pdfTemplateCategoryId)
		->where('status',1)
		->first();
		
		if(!$pdfTemplate){
			return ['status' => false];
		}
		
		$body = self::parseCommunicationTemplate($pdfTemplate['body'],$moduleData);
		$pdfTemplate['body'] = \Helper::convertToServerPath($body);
		return ['status' => true,'pdfTemplate' => $pdfTemplate];
	}
		 
	 /*
	 *----------------------------------------------
	 * End: Get the PDF Template accroding to clinic
	 * ---------------------------------------------
	 */
	 
	public static function tempBodyTags()
	{
		return [
			'{Clinic:Name}',
			'{OrvosDoctor:Name}',
			'{OrvosDoctor:NPINumber}',
			'{Patient:FirstName}',
			'{Patient:LastName}',
			'{Patient:DOB}',
			'{Patient:EHR}',
			'{Patient:Gender}',
			'{Patient:Notes}',
			'{Patient:LeftEyeStatus}',
			'{Patient:LeftEyeImages}',
			'{Patient:RightEyeStatus}',
			'{Patient:RightEyeImages}',
			'{Patient:RemarkBy}',
			'{Patient:LeftEyeRemarks}',
			'{Patient:RightEyeRemarks}',
			'{Patient:MedicalCondition}',
			'{Patient:FollowUp}',
			'{Patient:DiagnosisNote}',
			'{Patient:History}',
		];
	}
	 /*
	 *-----------------------------------------
	 * Start: Body Tags
	 * -----------------------------------------
	 */
	 
	  /*
	 *-----------------------------------------
	 * End: Body Tags
	 * -----------------------------------------
	 */
	public static function parseCommunicationTemplate($template,$data)
	{   
		$leftEyes = '<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;"><tr>';

		if(!empty($data->l_eye_images)){
			$leftEyesArr = json_decode($data->l_eye_images, true);
			if(count($leftEyesArr) == 1){
				$leftEyes .= '<td style="border:0;"></td>';
			}
			 
			foreach($leftEyesArr as $key => $image ){
				$lUrl = public_path('uploads/patients/'.$data->slug.'/'.$image);
				$leftEyes .= '<td width="33%" align="center" valign="top" >
				<img src="'.$lUrl.'" width="100" height="100"><br>
				<small>Image ' . ($key + 1) . '</small>
			  </td>';
			  
			}
			if(count($leftEyesArr) == 1){
				$leftEyes .= '<td style="border:0;"></td>';
			}
  
		}

		$leftEyes .= '</tr></table>';
		 
		$rightEyes = '<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;"><tr>';
		if(!empty($data->r_eye_images)){
			 
			$rightEyesArr = json_decode($data->r_eye_images, true);
			if(count($rightEyesArr) == 1){
				$rightEyes .= '<td style="border:0;"></td>';
			} 
			foreach($rightEyesArr as $key => $image ){
				$rUrl =  public_path('uploads/patients/'.$data->slug.'/'.$image);
				$rightEyes .= '<td width="33%" align="center" valign="top">
					<img src="'.$rUrl.'" width="100" height="100"><br>
					<small>Image ' . ($key + 1) . '</small>
				  </td>';
			}
			if(count($rightEyesArr) == 1){
				$rightEyes .= '<td style="border:0;"></td>';
			}
			 
			 
		}
		
		$rightEyes .= '</tr></table>';
		  
		$leftEyeRemarks = NULL;
		$rightEyeRemarks = NULL;
		$note = NULL;
		if(!empty($data->remark_result)){
			$examTest = json_decode($data->remark_result, true);
			
			if(!empty($examTest['exam_data']['leftEye'])){
				foreach($examTest['exam_data']['leftEye'] as $eKey => $eData){
					
					$examTypeData = \Helper::getExamTypeById($data['medical_condition_id'], $eData['exam_type'] ?? '','leftEye');
					if($examTypeData['status'] === 200 && $examTypeData['examType']){
						$leftEyeRemarks .= '<div style="margin-bottom: 10px;">'.$examTypeData['examType']['name'].' '.$examTypeData['examType']['code'].'</div>';
					}
					 
				}
			}
			
			if(!empty($examTest['exam_data']['rightEye'])){
				foreach($examTest['exam_data']['rightEye'] as $eKey => $eData){
					$examTypeData = \Helper::getExamTypeById($data['medical_condition_id'], $eData['exam_type'] ?? '','rightEye');
					if($examTypeData['status'] === 200 && $examTypeData['examType']){
						$rightEyeRemarks .= '<div style="margin-bottom: 10px;">'.$examTypeData['examType']['name'].' '.$examTypeData['examType']['code'].'</div>'; 
					}
				}
			}
			
			$note = $examTest['remark'];
		}
		
		$histories = NULL;
		if (!empty($data->medical_history)) {
			$medicalHistories = \Helper::getMedicalHistoryById($data->medical_history)['medical_history'];
			$total = count($medicalHistories);

			foreach ($medicalHistories as $key => $value) {
				// Add comma if not last, otherwise add period
				$histories .= $value['name'] . ($key == $total - 1 ? '.' : ', ');
			}
		}
 
		$tempBodyTags = self::tempBodyTags();
		$replacements = [];

		foreach ($tempBodyTags as $tag) {
			switch ($tag) {
				
				case '{OrvosDoctor:Name}':
					$replacements[$tag] = (($data->remarkBy->first_name ?? '') . ' ' . ($data->remarkBy->last_name ?? ''));
					break;
				 
				case '{OrvosDoctor:NPINumber}':
					$replacements[$tag] = $data->remarkBy->npi_number ?? '';
					break;
					
				case '{Clinic:Name}':
					$replacements[$tag] = $data->clinic->name ?? '';
					break;

				case '{Patient:FirstName}':
					$replacements[$tag] = $data->first_name ?? '';
					break;

				case '{Patient:LastName}':
					$replacements[$tag] = $data->last_name ?? '';
					break;

				case '{Patient:DOB}':
					$replacements[$tag] = \Helper::dateFormat($data->dob)['date'] ?? '';
					break;

				case '{Patient:EHR}':
					$replacements[$tag] = $data->mr_number ?? '';
					break;
					
				case '{Patient:LeftEyeStatus}':
					$replacements[$tag] =   \Helper::checkEyeStatus($data->l_eye)['status'] ?? '';
					break;

				case '{Patient:LeftEyeImages}':
					$replacements[$tag] = $leftEyes ?? '';
					break;
					
				case '{Patient:RightEyeStatus}':
					$replacements[$tag] =   \Helper::checkEyeStatus($data->r_eye)['status'] ?? '';
					break;

				case '{Patient:RightEyeImages}':
					$replacements[$tag] = $rightEyes ?? '';
					break;

				case '{Patient:RemarkBy}':
					$replacements[$tag] = (($data->remarkBy->first_name ?? '') . ' ' . ($data->remarkBy->last_name ?? ''));
					break;

				case '{Patient:LeftEyeRemarks}':
					$replacements[$tag] = $leftEyeRemarks ?? '';
					break;

				case '{Patient:RightEyeRemarks}':
					$replacements[$tag] = $rightEyeRemarks ?? '';
					break;

				case '{Patient:MedicalCondition}':
					$replacements[$tag] = \Helper::getMedicalConditionById($data->medical_condition_id)['medicalCondition']['name'] ?? '';
					break;

				case '{Patient:FollowUp}':
					$status = \Helper::getFollowUpStatusById($data['follow_up'])['fStatus'] ?? null;
					$replacements[$tag] = '<div class="badge badge-' . ($status['class'] ?? '') . '">' . ($status['name'] ?? '') . '</div>';
					break;

				case '{Patient:DiagnosisNote}':
					$replacements[$tag] = $note ?? '';
					break;

				case '{Patient:History}':
					$replacements[$tag] = $histories ?? '';
					break;
					
				case '{Patient:Gender}':
					$replacements[$tag] = ucwords(\Helper::getGenderById($data->gender)['gender']['name'])  ?? '' ;
					break;
					
				case '{Patient:Notes}':
					$replacements[$tag] = $data->note ?? '';
					break;
					 
			}
		}
	 
        // Replace placeholders
        return strtr($template, $replacements);
	}
	 
	/*
	 *-----------------------------------------
	 * Start: Convert to Server path
	 * -----------------------------------------
	 */
	public static function convertToServerPath($html)
	{
		return preg_replace_callback('/<img[^>]+src="([^"]+)"/i', function ($matches) {
			$src = $matches[1];

			// Only handle uploads from your editor folder
			if (strpos($src, '/uploads/editor/') !== false) {
				$path = parse_url($src, PHP_URL_PATH);
				$filename = basename($path);
				$fullPath = public_path('uploads/editor/' . $filename);

				if (file_exists($fullPath)) {
					return str_replace($src, $fullPath, $matches[0]);
				}
			}

			return $matches[0];
		}, $html);
	}

	/*
	 *-----------------------------------------
	 * End: Convert to Server path
	 * -----------------------------------------
	 */
	 
	/*
	 *-----------------------------------------
	 * Start: PDf Report Download Status
	 * -----------------------------------------
	 */
	 
	public static function pdfReportDownloadStatus()
	{
		return [
			0 => ['id' => 1,'name' => 'pending','class' => 'text-danger'],
			1 => ['id' => 2,'name' => 'downloaded','class' => 'text-success']
		];
	}
	 
	 /*
	 *-----------------------------------------
	 * End: PDf Report Download Status
	 * -----------------------------------------
	 */
	 
	/*
	 *--------------------------------------------
	 * Start: Get PDf Report Download Status By id
	 * -------------------------------------------
	 */
	 
	public static function pdfReportDownloadStatusById($id)
	{
		$pdfReportDownloadStatus = self::pdfReportDownloadStatus();
		 
		foreach($pdfReportDownloadStatus as $status)
		{
			if($status['id'] == $id){
				return ['status' => 200,'pdfReportDownloadStatus' => $status];
			}
			
		}
		
		return ['status' => 422];
		 
	}
	 
	 /*
	 *-----------------------------------------
	 * End: Get PDf Report Download Status By id
	 * -----------------------------------------
	 */
	 
	  
	
	/*
	 *-----------------------------------------
	 * Start: FAQ
	 * -----------------------------------------
	 */	
	public static function faq()
    {
        return [
            [
                'question' => 'As the Clinic Admin can I create another clinic for my organization?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">No. Clinic Admins can only create users for their respective clinics.</li></ul>'
            ],
            [
                'question' => 'Can there be more than 1 Clinic Admin at each clinic?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">No. There can only be 1 Clinic Admin at each clinic.</li></ul>'
            ],
            [
                'question' => 'What are the different roles at each clinic?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">(a) Clinic Admin – Create Users, Add Patients, Download Reports, Create PDF 	Templates, View Patients</li>
                             <li class="list-group-item list-group-item-action">(b) User – Download Reports, View Patients</li>
                             <li class="list-group-item list-group-item-action">(c) Doctors – Add Patients, View Patients, Download Reports</li>
                             <li class="list-group-item list-group-item-action">(d) Medical Assistant - Add Patients, View Patients, Download Reports</li></ul>'
            ],
            [
                'question' => 'How long will it take for me to get a diagnosis back?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Generally, diagnosis should be returned in 24 hours. In the event there may have been an unforeseen high patient volume that day it may take 48 hours.</li></ul>'
            ],
            [
                'question' => 'Are the Orvos doctors licensed in the state my clinic is in?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. All of our ophthalmologists have medical licenses in the state the clinic is located in.</li></ul>'
            ],
            [
                'question' => 'Is there a way to chart the patient’s retina history in the Orvos portal?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">No. We recommend storing their specific progression in the clinic’s EMR.</li></ul>'
            ],
            [
                'question' => 'What is the maximum number of images I can send for a patient?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">We recommend 2 images per eye. Although there is not a maximum number of images, there is a maximum 5MB size limit that can be uploaded per patient.</li></ul>'
            ],
            [
                'question' => 'As a Clinic Admin can I assign a user to multiple clinics?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. The user must choose the correct clinic when adding a patient.</li></ul>'
            ],
            [
                'question' => 'Can Orvos bill a patient’s medical insurance?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes, if a contract is in place with the patient’s health plan.</li></ul>'
            ],
            [
                'question' => 'Can a patient do Self-Pay with Orvos?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. The self-pay feature is available at https://orvoshealthcare.com and requires a debit or credit card.</li></ul>'
            ],
            [
                'question' => 'Can users share accounts?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">No. It is against HIPAA for users to share accounts.</li></ul>'
            ],
            [
                'question' => 'Can users change their own password?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. Each user should change the temporary password provided by the Clinic Admin upon first logon.</li></ul>'
            ],
            [
                'question' => 'Is there a way for Orvos to send reminders to patients based on follow up recommendations?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. If the patient’s email is added, they will get reminders. This feature is off by default.</li></ul>'
            ],
            [
                'question' => 'Can I export my patient list into Excel?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. All of a clinic’s patients can be exported into Excel.</li></ul>'
            ],
            [
                'question' => 'Can I add a patient without having to log into the portal?',
                'answer' => '<ul class="list-group"><li class="list-group-item list-group-item-action">Yes. Using a special URL, images can be uploaded to a clinic. This feature must be enabled.</li></ul>'
            ],
        ];
    }
	
	/*
	 *-----------------------------------------
	 * End: FAQ
	 * -----------------------------------------
	 */	
	 
	/**
	 *-----------------------------------------
     * Start: Google Map Api Key.
     * @return string
	 *-----------------------------------------
     */
	 
	public static function googleMapApiKey()
	{ 
		return ['google_map_api_key' => 'AIzaSyDoBhFjwVoFSyHv2lstUDUiDf30pj9CC4k'];
	}
	
	/**
	 *-----------------------------------------
     * End: Google Map Api Key.
     * @return string
	 *-----------------------------------------
     */
	 
	 /*
	 *-----------------------------------------
	 * Start: Recaptcha Credentails
	 * -----------------------------------------
	 */  
	public static function recaptchaCredentails($version = null) 
	{
		//utest5452@gmail.com
		$credentials =  [
			'v2' => [
				'site_key' => '6LeX5dwrAAAAAKRG205HjKlmXQS9TvSk0bCsXdnf',
				'secret_key' => '6LeX5dwrAAAAAMszoGRg-rOQDVj75ubvfngVuKIH',
			],
			
			'v3' => [
				'site_key' => '6LdQ4dwrAAAAAOAK_ArcqsgD9Uq4gFsGCNv1qlLh',
				'secret_key' => '6LdQ4dwrAAAAACObbWnBcVZLzHx5_9CReaBSJK9Q',
			],
			
		];
		
		
		 // If a version is specified and exists, return only that version
		if ($version && isset($credentials[$version])) {
			return $credentials[$version];
		}

		// Otherwise, return all credentials
		return $credentials;
	}	
	 
	 /*
	 *-----------------------------------------
	 * End: Recaptcha Credentails
	 * -----------------------------------------
	 */ 
  
	 /*
	 *-----------------------------------------
	 * Start: Recaptcha Verify
	 * -----------------------------------------
	 */ 
	public static function recaptchaVerify(Request $request): array
	{ 
		$response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret'   => self::recaptchaCredentails('v2')['secret_key'],
            'response' => $request->input('g-recaptcha-response'),
            'remoteip' => $request->ip(),
        ]);

        $recaptcha = $response->json();

        return ['status' => $recaptcha['success'] ?? false,'message' => self::recaptchaMessage()['message']];
	}
	
	public static function recaptchaMessage()
	{
		return ['message' => 'Please confirm you are not a robot.'];
	}
	 /*
	 *-----------------------------------------
	 * End: Recaptcha Verify
	 * -----------------------------------------
	 */  
	 
	public static function encodeData($data)
	{
		$password = "MyPaSsWoRd123!"; 
		return ['encoded' => base64_encode($data . '::' . $password)];
	}	
	
}

	