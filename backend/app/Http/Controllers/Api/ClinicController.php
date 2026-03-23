<?php

namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use Validator;
use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicUser;
use Brian2694\Toastr\Facades\Toastr;
use Illuminate\Support\Facades\Storage;
 
class ClinicController extends Controller
{ 
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index(Request $request)
    {  
		$haveAccess = \Helper::permission(1,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
 
        $clinics = \Helper::getClinics(true, $input)['clinics'];
        
        return response()->json(['clinics' => $clinics], 200); 
    }
	
	  
	 /**
     * Store the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
	public function store(Request $request)
    {   
		$haveAccess = \Helper::permission(1,'create');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		 
		$rules = Clinic::$rules;
		$messages = Clinic::$messages;
		
		if (!empty($input['is_dicom_enabled'])) {
			$rules['device_ids'] = 'required|array';
			$rules['device_ids.*'] = 'required|distinct';

			$messages['device_ids.required'] = 'At least one Device ID is required.';
			$messages['device_ids.*.required'] = 'Device ID is required.';
			$messages['device_ids.*.distinct'] = 'Duplicate Device IDs are not allowed.';
			
			$rules['device_type_id'] = 'required';
		}else{
			$input['is_dicom_enabled'] = 0;
			$input['device_id'] = NULL;
			 
		}
		
		if (!empty($input['is_fax_enabled'])) {
			$input['fax_number'] = preg_replace('/\D/', '', $input['fax_number']);
			//$rules['fax_number'] = 'required|unique:clinics,fax_number';
		}else{
			$input['is_fax_enabled'] = 0;
			$input['fax_number'] = NULL;
		}
		
		$validator = Validator::make($input,$rules,$messages);
		 
		if ($validator->fails()) { 
			return response()->json(['message' => $validator->errors()], 422);
		 
		}
		
		$input['user_id'] = \Auth::user()->id;
		$input['code'] = \Helper::genClinicCode()['code'];
		$input['slug'] = \Helper::genSlug($input['name'])['slug'];
		
		 if (!empty($input['files'])) {
			
            $files = $input['files'];
			$uploadedFiles = [];
    
           foreach ($files as $file) {
				$filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

				$destinationPath = 'uploads/clinics/' . $input['slug'];

				$file->storeAs($destinationPath, $filename, 'public');

				$uploadedFiles[] = $filename;
			}
    
            // Store the file paths as a JSON array in the database
            $input['files'] = json_encode($uploadedFiles);
        }
		
		if (!empty($input['image'])) {

			$image = $input['image'];
 
			// Generate filename
			$imageName = uniqid() . '_' . time() . '.' . $image->getClientOriginalExtension();

			// Store image
			$path = 'uploads/clinics/' .$input['slug'].'/logo';

			$image->storeAs($path, $imageName, 'public');
			 
			$input['image'] = $imageName;
  
		}
		
		$getLatLng = \Helper::getLatLng($input['address'])['response'];
		 
        $input['latitude'] = $getLatLng['latitude'];
        $input['longitude'] = $getLatLng['longitude'];
		 
		$clinic = Clinic::create($input);
		
		
		// if(\Auth::user()->role_id != 1){
			// ClinicUser::create([
				// 'user_id'   => \Auth::user()->id,
				// 'clinic_id' => $clinic->id,
				// 'is_admin' => \Auth::user()->role_id == 6 ? 1:0,
				
			// ]);
		// }
		 
        return response()->json(['message' => \Helper::alertMsg('create','Clinic','success')['message']], 200);  
        
    } 
	 
	/**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */

    public function show($id)
    {  
		$haveAccess = \Helper::permission(1,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
        $clinic = \Helper::getClinicById($id)['clinic'];
		if(!$clinic){
			return response()->json(['message' => \Helper::alertMsg('edit','Clinic','error')['message']], 404);
		}
		return response()->json(['clinic' => $clinic], 200);
    }
	
	/**
     * Edit the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */

    public function edit($id)
    {  
		$haveAccess = \Helper::permission(1,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
        $clinic = \Helper::getClinicById($id)['clinic'];
		if(!$clinic){
			return response()->json(['message' => \Helper::alertMsg('edit','Clinic','error')['message']], 404);
		}
		return response()->json(['clinic' => $clinic], 200);
    }
	 
	 /**
     * Update the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
	public function update(Request $request,$id)
    {  
		$haveAccess = \Helper::permission(1,'write');
		if(!$haveAccess){
			return abort(404);
		}
		
        $input = $request->all();
        $rules = Clinic::$rules;
		$messages = Clinic::$messages;
        $rules['name'] .= ',name,'.$id;  
        $rules['code'] .= ',code,'.$id;
        //$rules['poc_email'] .= ',poc_email,'.$id;
		
		if (!empty($input['is_dicom_enabled'])) {
			$rules['device_ids'] = 'required|array';
			$rules['device_ids.*'] = 'required|distinct';

			$messages['device_ids.required'] = 'At least one Device ID is required.';
			$messages['device_ids.*.required'] = 'Device ID is required.';
			$messages['device_ids.*.distinct'] = 'Duplicate Device IDs are not allowed.';
			
			$rules['device_type_id'] = 'required';
			 
		}else{
			$input['is_dicom_enabled'] = 0;
			$input['device_ids'] = NULL;
		}
		if (empty($input['is_patient_report_email_enabled'])) {
			$input['is_patient_report_email_enabled'] = 0;
		}
		
		if (!empty($input['is_fax_enabled'])) {
			$input['fax_number'] = preg_replace('/\D/', '', $input['fax_number']);
			//$rules['fax_number'] = 'required|unique:clinics,fax_number,' . $id;
		}else{
			$input['is_fax_enabled'] = 0;
			$input['fax_number'] = NULL;
		}

        $validator = Validator::make($input,$rules,$messages);
        if($validator->fails()){
			
			return response()->json(['message' => $validator->errors()], 422);
        }

        $clinic = \Helper::getClinicById($id,false)['clinic'];
        if(!$clinic){
           return response()->json(['message' => ['poc_email' => 'The clinic you are trying to update does not exist.']], 422);
        }
 
        $input['slug'] = \Helper::genSlug($input['name'])['slug'];

        // Rename directory if the slug has changed
		$oldPath = 'uploads/clinics/' . $clinic->slug;
		$newPath = 'uploads/clinics/' . $input['slug'];

		if ($clinic->slug !== $input['slug']) {
			if (Storage::disk('public')->exists($oldPath)) {
				Storage::disk('public')->move($oldPath, $newPath);
			}
		}

        $getLatLng = \Helper::getLatLng($input['address'])['response'];
        $input['latitude'] = $getLatLng['latitude'];
        $input['longitude'] = $getLatLng['longitude'];

		// Handle image removal
		if (!empty($input['remove_image'])) {
			if (!empty($clinic->getRawOriginal('image'))) {
				$oldImagePath = 'uploads/clinics/' . $input['slug'] . '/logo/' . $clinic->getRawOriginal('image');
				if (Storage::disk('public')->exists($oldImagePath)) {
					Storage::disk('public')->delete($oldImagePath);
				}
			}
			$input['image'] = null;
			unset($input['remove_image']);
		}

		if (!empty($input['image']) && $input['image'] instanceof \Illuminate\Http\UploadedFile) {

			$image = $input['image'];

			// Delete old image
			if (!empty($clinic->getRawOriginal('image'))) {
				$oldPath = 'uploads/clinics/' . $input['slug'] . '/logo/' . $clinic->getRawOriginal('image');

				if (Storage::disk('public')->exists($oldPath)) {
					Storage::disk('public')->delete($oldPath);
				}
			}

			// Generate filename
			$imageName = uniqid() . '_' . time() . '.' . $image->getClientOriginalExtension();

			// Store image
			$path = 'uploads/clinics/' .$input['slug'].'/logo';

			$image->storeAs($path, $imageName, 'public');

			$input['image'] = $imageName;
		}

		// Handle file removals
		$existingFiles = $clinic->getRawOriginal('files') ? json_decode($clinic->getRawOriginal('files'), true) : [];

		if (!empty($input['removed_files'])) {
			foreach ($input['removed_files'] as $removedFile) {
				$filePath = 'uploads/clinics/' . $input['slug'] . '/' . $removedFile;
				if (Storage::disk('public')->exists($filePath)) {
					Storage::disk('public')->delete($filePath);
				}
				$existingFiles = array_values(array_filter($existingFiles, function ($f) use ($removedFile) {
					return $f !== $removedFile;
				}));
			}
			unset($input['removed_files']);
		}

		// Handle new file uploads
		if (!empty($input['files'])) {
			$files = $input['files'];

			foreach ($files as $file) {
				if ($file instanceof \Illuminate\Http\UploadedFile) {
					$filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
					$file->storeAs('uploads/clinics/' . $input['slug'], $filename, 'public');
					$existingFiles[] = $filename;
				}
			}
		}

		$input['files'] = json_encode($existingFiles);
  
        $clinic->update($input);
        
        return response()->json(['message' => \Helper::alertMsg('update','Clinic','success')['message']], 200); 
    }
	  
	 /**
     * Destroy the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
	 
    public function destroy(Request $request, $id)
    {
		$haveAccess = \Helper::permission(1,'delete');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$clinic = \Helper::getClinicById($id)['clinic'];
		if(!$clinic){
			return response()->json(['message' => \Helper::alertMsg('delete','Clinic','error')['message']], 404);
		}
		
		$clinic->delete();
		 
        return response()->json(['message' => \Helper::alertMsg('delete','Clinic','success')['message']], 200); 
    }
  
}