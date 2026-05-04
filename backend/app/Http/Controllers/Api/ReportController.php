<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{ 

	public function clinicPatient(Request $request)
	{
		$haveAccess = \Helper::permission(6,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		  
		// Validation rules
		if(!empty($input['from_date']) && !empty($input['to_date'])){
            $validator = Validator::make($input, [
				'from_date' => ['required', 'date_format:m-d-Y', 'before_or_equal:to_date'],
				'to_date'   => ['required', 'date_format:m-d-Y'],
			]);

			if ($validator->fails()) {
				return response()->json([
					'status' => false,
					'message' => 'Validation failed',
					'errors' => $validator->errors()
				], 422);
			}
        } 
		$filters = [];
		$filters['paginate'] = false; 
		  
		if(!empty($input['from_date'])){
			$filters['from_date'] = $input['from_date'];
		}
		
		if(!empty($input['to_date'])){
			$filters['to_date'] = $input['to_date'];
		}
		
		if(!empty($input['month'])){
			$filters['month'] = $input['month'];
		}
          
		$patients = \Helper::getPatients(false,$filters)['patients'];

		$patientsUploaded = $patients
		->groupBy(function ($patient) {
			// First, group by clinic name
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function ($clinicPatients) {
			// Then, group by doctor (clinic user)
			$doctors = $clinicPatients
				->groupBy(function ($patient) {
					// Use full name for grouping, fallback if user not present
					 
					if (!empty($patient->user)) {
						return trim(
							($patient->user->first_name ?? '') . ' ' .
							($patient->user->last_name ?? '') .
							' (' . ($patient->user->role->name ?? '') . ')'
						);
					}
					return 'Unassigned Doctor (Self-Registered Patient)'; // or return ''; if you want empty string instead of null

				})
				->map(function ($doctorPatients) {
					// Count patients per doctor
					return $doctorPatients->count();
				});

			// Add total patients per clinic
			$doctors['Total'] = $doctors->sum();

			return $doctors;
		});
		
		 
  
		// Total summary by doctor across all clinics
		$totalSummary = $patients
		->groupBy(function ($patient) {
			// Group by doctor's full name
			if (!empty($patient->user)) {
				return trim(
					($patient->user->first_name ?? '') . ' ' .
					($patient->user->last_name ?? '') .
					' (' . ($patient->user->role->name ?? '') . ')'
				);
			}
			return 'Unassigned Doctor (Self-Registered Patient)';
		})
		->map(function ($doctorPatients) {
			// Count patients per doctor
			return $doctorPatients->count();
		});

		// Add overall total across all doctors
		$totalSummary['Total'] = $totalSummary->sum();
 
		return response()->json(['patientsUploaded' => $patientsUploaded, 'totalSummary' => $totalSummary], 200);
        
		
	}
	
	public function orvosDoctorReview(Request $request)
	{
        $haveAccess = \Helper::permission(6,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
			
        $input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
        
		// Validation rules
		if(!empty($input['from_date']) && !empty($input['to_date'])){
            $validator = Validator::make($input, [
				'from_date' => ['required', 'date_format:m-d-Y', 'before_or_equal:to_date'],
				'to_date'   => ['required', 'date_format:m-d-Y'],
			]);

			if ($validator->fails()) {
				return response()->json([
					'status' => false,
					'message' => 'Validation failed',
					'errors' => $validator->errors()
				], 422);
			}
        } 
		 
		
		$filters = [];
		$filters['paginate'] = false; 
		$filters['diagnosis_status'] = 1;
		
		if(!empty($input['from_date'])){
			 $filters['from_date'] = $input['from_date'];
		}
		
		if(!empty($input['to_date'])){
			 $filters['to_date'] = $input['to_date'];
		}
		
		if(!empty($input['month'])){
			 $filters['month'] = $input['month'];
		}
         
		$patients = \Helper::getPatients(false,$filters)['patients'];

		$orvosDoctorReviews = $patients
		->groupBy(function($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function($clinicPatients) {
			// Group by doctor inside each clinic
			$doctors = $clinicPatients->groupBy(function($patient) {
				return trim(
					($patient->remarkBy->first_name ?? '') . ' ' .
					($patient->remarkBy->last_name ?? '') .
					' (' . ($patient->remarkBy->role->name ?? '') . ')'
				);
			})->map(function($doctorPatients) {
				return $doctorPatients->count(); // Count per doctor
			});

			// Add total count for this clinic
			$doctors['Total'] = $doctors->sum();

			return $doctors;
		});
 
		// Total summary by doctor across all clinics
		$totalSummary = $patients
			->groupBy(function($patient) {
				return trim(
					($patient->remarkBy->first_name ?? '') . ' ' .
					($patient->remarkBy->last_name ?? '') .
					' (' . ($patient->remarkBy->role->name ?? '') . ')'
				);
			})
			->map(function($doctorPatients) {
				return $doctorPatients->count(); // count per doctor
			});

		// Add overall total across all doctors
		$totalSummary['Total'] = $totalSummary->sum();
 
		return response()->json(['orvosDoctorReviews' => $orvosDoctorReviews, 'totalSummary' => $totalSummary], 200);
      
    }
  
    public function getDoctorStates(Request $request)
    {
        $doctorIds = $request->input('doctor_ids', []);

        $doctors = User::with('clinicUsers', 'licenses.getState')
                    ->whereIn('id', $doctorIds)
                    ->get();

        return response()->json([
            'doctors' => $doctors
        ]);
    }

}
