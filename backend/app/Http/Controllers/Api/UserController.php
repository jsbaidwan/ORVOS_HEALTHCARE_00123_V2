<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClinicUser;
use App\Models\UserLicense;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
  
class UserController extends Controller
{ 
	public function index(Request $request)
	{	
		$haveAccess = \Helper::permission(3,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$users = \Helper::users(true,$input)['users']; 
		return response()->json(['users' => $users], 200);
		 
	}
	
	public function store(Request $request)
	{	
		$haveAccess = \Helper::permission(3,'create');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$rules = User::$rules;
		$messages = User::$messages;
		
		$insurance = $request->input('insurance_carriers_ids', []);
		$insurance = array_map(function($row) {
			return array_filter($row, function($carrier, $key) {
				if (!is_array($carrier)) return true;
				return !empty(array_filter($carrier));
				return false;
			}, ARRAY_FILTER_USE_BOTH);
		}, $insurance);

		  
		$input['insurance_carriers_ids'] =  $insurance;
		 
		$rules['clinic_ids'] = 'required';
        if($input['role_id'] == 2){
            unset($rules['clinic_ids']);
			$rules['npi_number'] = 'required|unique:users';
			//$rules['caqh_id'] = 'required|unique:users';
			//$rules['provider_id'] = 'required|unique:users';
            $rules['licence_number.*'] = 'required|unique:user_licenses,licence_number';
            $rules['l_state_id.*'] = 'required';
            $rules['expiry_date.*'] = 'required|nullable';
			//$rules['insurance_carriers_ids.*'] = 'required'; 
			$rules['signature'] = 'required';
			//$rules['documents'] = 'required';
			     
			foreach($input['insurance_carriers_ids'] as $iKey => $subArray){
				// If carrier 6 exists in this sub-array, require 'medicare'
				
				if (in_array(6,$subArray)) {
					$rules["insurance_carriers_ids.$iKey.6.medicare"] = 'required|string';
				}

				// If carrier 9 exists, require 'other' field
				if (in_array(9,$subArray)) {
					$rules["insurance_carriers_ids.$iKey.9.other"] = 'required|string';
				}
			} 
			  
        }
		
        $messages['clinic_ids.required'] = 'The clinic field is required.';

        $validate = Validator::make($input,$rules,$messages); 
		$messages = User::$messages;
		$validator = Validator::make($input, $rules,$messages);
		   
		if ($validator->fails()) { 
			return response()->json(['message' => $validator->errors()], 422);
		 
		}
		 
		$input['user_name'] = \Helper::genSlug($input['first_name'].'-'.$input['last_name'])['slug'];

        $getLatLng = \Helper::getLatLng($input['address'])['response'];
        $input['latitude'] = $getLatLng['latitude'];
        $input['longitude'] = $getLatLng['longitude'];
 
        if(!empty($input['clinic_ids'])){
            $clinicHasAdmin = \Helper::clinicHasAdmin($input['clinic_ids'],null,$input['role_id'])['hasAdminRsp'];
            if($clinicHasAdmin['hasAdmin'] == true){
				return response()->json(['message' => [ 'clinic_ids' => strip_tags($clinicHasAdmin['message'])] ], 422);
                 
            }
        }
          
        $input['password'] = \Hash::make($input['password']);
       
        if ($request->hasFile('image')) {
			$file = $request->file('image');

			// Generate filename
			$filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			// Folder path inside storage/app/public
			$folder = 'uploads/users/' . $input['user_name'];

			// Store file (auto creates directory)
			$path = $file->storeAs($folder, $filename, 'public');

			// Save only filename OR full path (your choice)
			$input['image'] = $filename; 
			// OR
			// $input['image'] = $path;
		}
		
		$input['code'] = \Helper::genUserCode($input['role_id'])['code'];
        if(!empty($input['dob'])){
         $input['dob'] = \Helper::changeDateFormat($input['dob'])['date'];
        }
         
        $licenseData = [];
        if ($input['role_id'] == 2) {
			
			if ($request->hasFile('signature')) {
				$file = $request->file('signature');

				// Generate filename
				$filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

				// Folder inside storage/app/public
				$folder = 'uploads/users/' . $input['user_name'] . '/signature';

				// Store file
				$path = $file->storeAs($folder, $filename, 'public');

				// Save filename OR full path
				$input['signature'] = $filename;
				// OR
				// $input['signature'] = $path;
			}
			
			if ($request->hasFile('documents')) {
				$documents = $request->file('documents');

				$docArr = [];
				$folder = 'uploads/users/' . $input['user_name'] . '/documents';

				foreach ($documents as $document) {
					$filename = time() . '_' . uniqid() . '.' . $document->getClientOriginalExtension();

					// Store file
					$path = $document->storeAs($folder, $filename, 'public');

					// Save filename OR path
					$docArr[] = $filename;
					// OR → $docArr[] = $path;
				}

				if (!empty($docArr)) {
					$input['documents'] = json_encode($docArr);
				}
			}
			
            if(!empty($input['licence_number'])){
                $licenseData = [
                    'licence_number' => $input['licence_number'],
                    'l_state_id' => $input['l_state_id'], // Corrected from l_state_id
                    'expiry_date' => $input['expiry_date'],
					 
                ];
				 
                $licenseNumbers = array_filter(array_map('trim', $licenseData['licence_number'])); 
        
                $existingLicenses = UserLicense::whereIn('licence_number', $licenseNumbers)
                    ->pluck('licence_number')
                    ->map(function ($item) {
                        return strtolower(trim($item));
                    })
                    ->toArray();
                $newLicenses = []; 
                $errors = [];  
                foreach ($licenseData['licence_number'] as $key => $licence_number) {
                    if (!empty($licence_number) && !empty($licenseData['l_state_id'][$key]) && !empty($licenseData['expiry_date'][$key])) {
                        $licence_number = strtolower(trim($licence_number));
                      
                        if (in_array($licence_number, $existingLicenses)) {
                            $errors["licence_number.$key"] = "Licence number $licence_number already exists in the database.";
                            continue; 
                        }
                      
                        if (in_array($licence_number, $newLicenses, true)) {
                            $errors["licence_number.$key"] = "Licence number $licence_number is duplicated in your new entries.";
                            continue; 
                        }
        
                        $newLicenses[] = $licence_number;
                    }
                }  
     
                if (!empty($errors)) {
					return response()->json(['message' => $errors ], 422);
                      
                }
                
            }
            
          
        } 
        unset($input['licence_number']);
        unset($input['l_state_id']); 
        unset($input['expiry_date']);
        $input['expiry_reminder'] = $request->has('expiry_reminder') ? 1 : 0;
         
        // echo'<pre>'; print_r($input);die;
        $user = User::create($input);

        if ($input['role_id'] == 2 && !empty($licenseData['licence_number'])) {
            foreach ($licenseData['licence_number'] as $key => $licence_number) {
                if (!empty($licence_number) && !empty($licenseData['l_state_id'][$key]) && !empty($licenseData['expiry_date'][$key])) {
                    $licence_number = strtolower(trim($licence_number));
                    
					$carriers = isset($input['insurance_carriers_ids'][$key])
					? $input['insurance_carriers_ids'][$key]
					: null; // or []
			
                    // Insert unique licenses
                    UserLicense::create([
                        'user_id' => $user->id,
                        'licence_number' => $licence_number,
                        'l_state_id' => $licenseData['l_state_id'][$key],
                        'expiry_date' => \Helper::changeDateFormat($licenseData['expiry_date'][$key])['date'],
						'insurance_carriers_ids' => json_encode($carriers),
                    ]);
                }
            }
    
        }
        if(!empty($input['clinic_ids'])){
            if(count($input['clinic_ids']) > 0){
    
                foreach($input['clinic_ids'] as $clinicId){
                    $hasClinicUser = ClinicUser::where('clinic_id',$clinicId)->where('user_id',$user->id)->first();
                    if($hasClinicUser){
                        $hasClinicUser->update([
                            'user_id'   => $user->id,
                            'clinic_id' => $clinicId,
                            'is_admin' => $input['role_id'] == 6 ? 1:0,
                            
                        ]);
                    }else{
                        ClinicUser::create([
                            'user_id'   => $user->id,
                            'clinic_id' => $clinicId,
                            'is_admin' => $input['role_id'] == 6 ? 1:0,
                            
                        ]);
                    }
                    
                } 
            }
        }
		
		\Log::save(
			'User Created.',
			'The User has been created by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'User',
			$user->id
		);
		  
		return response()->json(['user' => $user,'message' => 'User created successfully.'], 200);
	}
	
	public function update(Request $request,$id)
	{	
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all(); 
		 
		$insurance = $request->input('insurance_carriers_ids', []);
		
		$insurance = array_map(function($row) {
			return array_filter($row, function($carrier, $key) {
				if (!is_array($carrier)) return true;
				return !empty(array_filter($carrier));
				return false;
			}, ARRAY_FILTER_USE_BOTH);
		}, $insurance);
		
		 
		$input['insurance_carriers_ids'] =  $insurance;
		
		$rules = User::$rules;
		unset($rules['password']);
		unset($rules['confirm_password']);
		$rules['password'] = 'nullable|required_with:confirm_password|same:confirm_password|min:8|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/';
		$rules['confirm_password'] = 'nullable|required_with:password';
		
		$rules['email'] .= ',email,' . $id;
       
		$user = \Helper::getUserById($id)['user'];
		if (!$user) {
			return response()->json(['email' => 'The user you are trying to update does not exist.'], 422);
			 
		}
    
		if ($input['role_id'] == 2) {
			$rules['npi_number'] = 'required|unique:users,npi_number,' . $id;
			//$rules['caqh_id'] = 'required|unique:users,caqh_id,' . $id;
			//$rules['provider_id'] = 'required|unique:users,provider_id,' . $id;
            
             foreach ($request->input('licence_number') as $index => $licenceNumber) {
               // Check if this license number is already assigned to another user
                $existingLicense = UserLicense::where('licence_number', $licenceNumber)
                ->where('user_id', '!=', $id) // Ensure it's not the same user
                ->exists(); // Check if any record exists

                if ($existingLicense) {
					$licencesErr['message'] = ["licences.$index.licence_number" => "This license number is already assigned to another user."]; 
					return response()->json($licencesErr, 422);
                  
                }

                $rules["licence_number.$index"] = [
                    'required',
                    Rule::unique('user_licenses', 'licence_number')
                        ->where('user_id', $id) // Ensure uniqueness within the same user
                        ->ignore(UserLicense::where('user_id', $id)->where('licence_number', $licenceNumber)->value('id'), 'id'), // Ignore if the user already owns it
                ];
                 
            }
			
			$rules['l_state_id.*'] = 'required';
			$rules['expiry_date.*'] = 'required|nullable';
			//$rules['insurance_carriers_ids.*'] = 'required'; 
			
			foreach($input['insurance_carriers_ids'] as $iKey => $subArray){
				// If carrier 6 exists in this sub-array, require 'medicare'
				
				if (in_array(6,$subArray)) {
					$rules["insurance_carriers_ids.$iKey.6.medicare"] = 'required|string';
				}

				// If carrier 9 exists, require 'other' field
				if (in_array(9,$subArray)) {
					$rules["insurance_carriers_ids.$iKey.9.other"] = 'required|string';
				}
			} 
			 
			if(empty($user->signature)){
				$rules['signature'] = 'required';
			}
			if(empty($user->documents) || count(json_decode($user->documents, true)) == 0){
				//$rules['documents'] = 'required';
			}
		}
     
		$validate = Validator::make($input, $rules);
		
		if ($validate->fails()) {
			
			return response()->json(['message' => $validator->errors()], 422);
	 
		}
		
		$input['user_name'] = \Helper::genSlug($input['first_name'] . '-' . $input['last_name'])['slug'];
		
		if ($input['role_id'] == 2) {
			
			// Handle signature removal
			if (!empty($input['remove_signature'])) {
				if (!empty($user->signature)) {
					$oldPath = 'uploads/users/' . $user->user_name . '/signature/' . $user->signature;
					if (Storage::disk('public')->exists($oldPath)) {
						Storage::disk('public')->delete($oldPath);
					}
				}
				$input['signature'] = null;
				unset($input['remove_signature']);
			} elseif ($request->hasFile('signature')) {
				$file = $request->file('signature');

				$filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
				$folder = 'uploads/users/' . $input['user_name'] . '/signature';

				// Delete old file (if exists)
				if (!empty($user->signature)) {
					$oldPath = 'uploads/users/' . $user->user_name . '/signature/' . $user->signature;

					if (Storage::disk('public')->exists($oldPath)) {
						Storage::disk('public')->delete($oldPath);
					}
				}

				// Store new file
				$path = $file->storeAs($folder, $filename, 'public');

				$input['signature'] = $filename;
			}
			
			// Handle document removals
			$existingDocuments = !empty($user->documents) ? json_decode($user->documents, true) : [];
			$existingDocuments = is_array($existingDocuments) ? $existingDocuments : [];

			if (!empty($input['removed_documents'])) {
				foreach ($input['removed_documents'] as $removedDoc) {
					$filePath = 'uploads/users/' . $user->user_name . '/documents/' . $removedDoc;
					if (Storage::disk('public')->exists($filePath)) {
						Storage::disk('public')->delete($filePath);
					}
					$existingDocuments = array_values(array_filter($existingDocuments, function ($f) use ($removedDoc) {
						return $f !== $removedDoc;
					}));
				}
				unset($input['removed_documents']);
			}

			// Handle new document uploads
			if ($request->hasFile('documents')) {
				$folder = 'uploads/users/' . $input['user_name'] . '/documents';

				foreach ($request->file('documents') as $file) {
					$filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

					$file->storeAs($folder, $filename, 'public');

					$existingDocuments[] = $filename;
				}
			}

			$input['documents'] = json_encode($existingDocuments);
			 
		}
     
         
         $getLatLng = \Helper::getLatLng($input['address'])['response'];
         $input['latitude'] = $getLatLng['latitude'];
         $input['longitude'] = $getLatLng['longitude'];
     
         if (!empty($input['clinic_ids'])) {
			$clinicHasAdmin = \Helper::clinicHasAdmin($input['clinic_ids'], $id, $input['role_id'])['hasAdminRsp'];
			if ($clinicHasAdmin['hasAdmin'] == true) {
				return response()->json(['message' => [ 'clinic_ids' => strip_tags($clinicHasAdmin['message'])] ], 422);
			}
     
             $existingClinicIds = ClinicUser::where('user_id', $id)->pluck('clinic_id')->toArray();
             $clinicsToRemove = array_diff($existingClinicIds, $input['clinic_ids']);
             ClinicUser::where('user_id', $id)->whereIn('clinic_id', $clinicsToRemove)->delete();
     
             foreach ($input['clinic_ids'] as $clinicId) {
                 $hasClinicUser = ClinicUser::where('clinic_id', $clinicId)->where('user_id', $id)->first();
                 if ($hasClinicUser) {
                     $hasClinicUser->update([
                         'user_id' => $id,
                         'clinic_id' => $clinicId,
                         'is_admin' => $input['role_id'] == 6 ? 1 : 0,
                     ]);
                 } else {
                     ClinicUser::create([
                         'user_id' => $id,
                         'clinic_id' => $clinicId,
                         'is_admin' => $input['role_id'] == 6 ? 1 : 0,
                     ]);
                 }
             }
         }
     
		if (!empty($input['password'])) {
			$input['password'] = \Hash::make($input['password']);
		} else {
             unset($input['password']);
		}
     
		$oldFolder = 'uploads/users/' . $user->user_name;
		$newFolder = 'uploads/users/' . $input['user_name'];

		// Handle image (avatar) removal
		if (!empty($input['remove_image'])) {
			if (!empty($user->image)) {
				$oldPath = $oldFolder . '/' . $user->image;
				if (Storage::disk('public')->exists($oldPath)) {
					Storage::disk('public')->delete($oldPath);
				}
			}
			$input['image'] = null;
			unset($input['remove_image']);
		} elseif ($request->hasFile('image')) {

			$file = $request->file('image');
			$filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			// Delete old image
			if (!empty($user->image)) {
				$oldPath = $oldFolder . '/' . $user->image;

				if (Storage::disk('public')->exists($oldPath)) {
					Storage::disk('public')->delete($oldPath);
				}
			}

			// Store new image
			$file->storeAs($newFolder, $filename, 'public');

			$input['image'] = $filename;

		} else {

			// If username changed → move file
			if ($user->user_name !== $input['user_name'] && !empty($user->image)) {

				$oldPath = $oldFolder . '/' . $user->image;
				$newPath = $newFolder . '/' . $user->image;

				if (Storage::disk('public')->exists($oldPath)) {
					Storage::disk('public')->move($oldPath, $newPath);
				}
			}

			$input['image'] = $user->image;
		}
     
		if ($input['role_id'] != $user->role_id) {
             $input['code'] = \Helper::genUserCode($input['role_id'])['code'];
		}
     
		if (!empty($input['dob'])) {
             $input['dob'] = \Helper::changeDateFormat($input['dob'])['date'];
		}
          
		unset($input['licence_number']);
		unset($input['l_state_id']);
		unset($input['expiry_date']);

		$input['expiry_reminder'] = $request->has('expiry_reminder') ? 1 : 0;

		if (!empty($request->input('licence_number'))) {
            $newLicenses = [];
            $inputLicenceNumbers = $request->input('licence_number');
            $duplicateIndexes = [];
        
            foreach ($inputLicenceNumbers as $index => $licenceNumber) {
                if (empty($licenceNumber)) {
                    continue; 
                }
        
                if (count(array_keys($inputLicenceNumbers, $licenceNumber)) > 1) {
                    $duplicateIndexes["licence_number.$index"] = "Duplicate license numbers are not allowed.";
                }
        
                $existingLicense = UserLicense::where('licence_number', $licenceNumber)
                    ->where('user_id', '!=', $id) 
                    ->exists();
        
                if ($existingLicense) {
					$duplicateIndexes['message'] = ["licences.$index.licence_number" => "This license number is already assigned to another user."]; 
                   
                }
            }
        
            if (!empty($duplicateIndexes)) {
				return response()->json($duplicateIndexes, 422);
                
            }
        }

		$user->update($input);
 
         if (!empty($request->input('licence_number'))) {
            $newLicenses = [];
            $inputLicenceNumbers = $request->input('licence_number');
        
            foreach ($inputLicenceNumbers as $index => $licenceNumber) {
                if (!empty($licenceNumber)) {
                    $expiryDate = $request->input('expiry_date')[$index] ?? null;
                    if (!empty($expiryDate)) {
                        $expiryDate = \Helper::changeDateFormat($expiryDate)['date'];
                    }
                    $newLicenses[] = [
                        'id' => $request->input('license_id')[$index] ?? null,
                        'licence_number' => $licenceNumber,
                        'l_state_id' => $request->input('l_state_id')[$index] ?? null,
                        'expiry_date' => $expiryDate,
                    ];
                }
            }
        
            $existingLicenseIds = $user->licenses()->pluck('id')->toArray();
            foreach ($newLicenses as $key => $licenseData) {
				
				$carriers = isset($input['insurance_carriers_ids'][$key])
					? $input['insurance_carriers_ids'][$key]
					: null; // or []
					
                if ($licenseData['id']) {
					 
                    $user->licenses()->where('id', $licenseData['id'])->update([
                        'licence_number' => $licenseData['licence_number'],
                        'l_state_id' => $licenseData['l_state_id'],
                        'expiry_date' => $licenseData['expiry_date'],
						'insurance_carriers_ids' => json_encode($carriers),
                    ]);
                    unset($existingLicenseIds[array_search($licenseData['id'], $existingLicenseIds)]);
                } else {
					
					$licenseData['insurance_carriers_ids'] = json_encode($carriers);
                    $user->licenses()->create($licenseData);
                }
            }
        
            if (!empty($existingLicenseIds)) {
                $user->licenses()->whereIn('id', $existingLicenseIds)->delete();
            }
        }
		
		\Log::save(
			'User Updated.',
			'The User has been updated by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'User',
			$user->id
		);
        
		return response()->json(['user' => $user,'message' => 'User updated successfully.'], 200);
	}
	
	public function show($id)
	{
		$user = \Helper::getUserById($id)['user'];
		if(!$user){
			return response()->json(['message' => 'We couldn’t find the user you’re looking for.'], 404);
		}
		return response()->json(['user' => $user], 200);
	}
	
	public function destroy($id)
	{ 
		$user = \Helper::getUserById($id)['user'];
		if(!$user){
			return response()->json(['message' => 'We couldn’t find the user you’re looking for.'], 404);
		}
		
		$image = $user->image['name'];
		 
		$filePath = 'uploads/users/' . $user['username'] . '/' . $image;

		if (!empty($image) && Storage::disk('public')->exists($filePath)) {

			// Delete file
			Storage::disk('public')->delete($filePath);

			// Try removing directory (only works if empty)
			$dirPath = 'uploads/users/' . $user['username'];

			if (empty(Storage::disk('public')->files($dirPath)) &&
				empty(Storage::disk('public')->directories($dirPath))) {

				Storage::disk('public')->deleteDirectory($dirPath);
			}
}
		$user->delete();
		\Log::save(
			'User Deleted.',
			'The User has been deleted by '.\Auth::user()->first_name.' '.\Auth::user()->last_name.'.',
			'User', 
			$user->id
		);
		return response()->json(['message' => 'User deleted successfully.'], 200);
		
	}
	
}