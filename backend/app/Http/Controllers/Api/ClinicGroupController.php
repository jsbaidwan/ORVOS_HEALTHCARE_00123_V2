<?php

namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use Validator;
use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicUser;
use App\Models\ClinicGroup;
use Brian2694\Toastr\Facades\Toastr;
  
class ClinicGroupController extends Controller
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
  
        $clinicGroups = \Helper::getClinicGroups(true, $input)['clinicGroups'];
        
        return response()->json(['clinicGroups' => $clinicGroups], 200); 
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
		
		$input['user_id'] = \Auth::user()->id;
		ClinicGroup::create($input);
		 
        return response()->json(['message' => \Helper::alertMsg('create','Clinic Group','success')['message']], 200);  
        
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
		
        $clinicGroup = \Helper::getClinicGroupById($id)['clinicGroup'];
		if(!$clinicGroup){
			return response()->json(['message' => \Helper::alertMsg('edit','Clinic Group','error')['message']], 404);
		}
		return response()->json(['clinicGroup' => $clinicGroup], 200);
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
		$clinicGroup = \Helper::getClinicGroupById($id)['clinicGroup'];
		if(!$clinicGroup){
			return response()->json(['message' => \Helper::alertMsg('update','Clinic Group','error')['message']], 404);
		}
		
		$clinicGroup->update($input);
		 
        return response()->json(['message' => \Helper::alertMsg('update','Clinic Group','success')['message']], 200); 
         
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
		
		$clinicGroup = \Helper::getClinicGroupById($id)['clinicGroup'];
		if(!$clinicGroup){
			return response()->json(['message' => \Helper::alertMsg('delete','Clinic Group','error')['message']], 404);
		}
		
		$clinicGroup->delete();
		 
        return response()->json(['message' => \Helper::alertMsg('delete','Clinic Group','success')['message']], 200); 
    }
  
}