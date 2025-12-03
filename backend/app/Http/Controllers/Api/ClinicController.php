<?php

namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use Validator;
use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicUser;
use Brian2694\Toastr\Facades\Toastr;
  
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
		
		$rules = Clinic::rules();
		
		$validator = Validator::make($input, $rules);
		 
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
                // Generate a unique filename with a timestamp
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    
                // Create the directory if it doesn't exist
                $destinationPath = public_path('uploads/clinics/' . $input['slug']);
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
    
                // Move the file to the directory
                $file->move($destinationPath, $filename);
    
                // Store the filename in an array
                $uploadedFiles[] = $filename;
            }
    
            // Store the file paths as a JSON array in the database
            $input['files'] = json_encode($uploadedFiles);
        }
		
		$getLatLng = \Helper::getLatLng($input['address'])['response'];
        $input['latitude'] = $getLatLng['latitude'];
        $input['longitude'] = $getLatLng['longitude'];
		
		Clinic::create($input);
		
		 if (!empty($input['image'])) {
            $image = $input['image'];
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
             // Create the directory if it doesn't exist
             $destinationPath = public_path('uploads/clinic_logos/' . $clinic->id);
             if (!file_exists($destinationPath)) {
                 mkdir($destinationPath, 0755, true);
             }
            $image->move($destinationPath, $imageName);
            $clinic->image = $imageName;
            $clinic->save();
        }
		
		if(\Auth::user()->role_id != 1){
			ClinicUser::create([
				'user_id'   => \Auth::user()->id,
				'clinic_id' => $clinic->id,
				'is_admin' => \Auth::user()->role_id == 6 ? 1:0,
				
			]);
		}
		 
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
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		
		$rules = Clinic::rules($id);
	 
        $rules['name'] .= ',name,'.$id;  
        $rules['code'] .= ',code,'.$id;
        //$rules['poc_email'] .= ',poc_email,'.$id;
		
		$validator = Validator::make($input, $rules);
		 
		if ($validator->fails()) { 
			return response()->json(['message' => $validator->errors()], 422);
		 
		}
		
		$clinic = \Helper::getClinicById($id)['clinic'];
		if(!$clinic){
			return response()->json(['message' => \Helper::alertMsg('update','Clinic','error')['message']], 404);
		}
		
		// Rename directory if the slug has changed
        $oldPath = public_path('uploads/clinics/' . $clinic->slug);
        $newPath = public_path('uploads/clinics/' . $input['slug']);

        if ($clinic->slug !== $input['slug']) {
            if (file_exists($oldPath)) {
                rename($oldPath, $newPath); 
            }
        }

        $getLatLng = \Helper::getLatLng($input['address'])['response'];
        $input['latitude'] = $getLatLng['latitude'];
        $input['longitude'] = $getLatLng['longitude'];

        if (!empty($input['image'])) {
            $image = $input['image'];
            $oldImage =  public_path('uploads/clinic_logos/' . $id.'/'.$clinic->image);
            if(file_exists($oldImage) && !empty($clinic->image)){
                unlink($oldImage);
            }

            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
             // Create the directory if it doesn't exist
             $destinationPath = public_path('uploads/clinic_logos/' . $id);
             if (!file_exists($destinationPath)) {
                 mkdir($destinationPath, 0755, true);
             }
            $image->move($destinationPath, $imageName);
            $input['image'] =  $imageName;
             
        }

         // Handle file uploads
		if (!empty($input['files'])) {
            $files = $input['files'];
            $uploadedFiles = [];

            // Existing files
            if ($clinic->files) {
                $existingFiles = json_decode($clinic->files, true);

                foreach ($existingFiles as $file) {
                    // $filePath = public_path('uploads/clinics/' . $clinic->slug . '/' . $file);
                    // if (file_exists($filePath)) {
                    //     unlink($filePath); // Delete the file
                    // }
                    $uploadedFiles[] = $file;
                }
                
                
            }

            foreach ($files as $file) {
                // Generate a unique filename with a timestamp
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                // Create the directory if it doesn't exist
                $destinationPath = public_path('uploads/clinics/' . $input['slug']);
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

                // Move the file to the directory
                $file->move($destinationPath, $filename);

                // Store the filename in an array
                $uploadedFiles[] = $filename;
            }

            // Store the new file paths as a JSON array in the database
            $input['files'] = json_encode($uploadedFiles);
        }

		
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