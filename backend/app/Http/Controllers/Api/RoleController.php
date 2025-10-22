<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Role;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;

class RoleController extends Controller
{ 
    public function index(Request $request)  {

		$input = $request->all();
		 
        $roles = \Helper::getRoles($input)['roles'];
		$paginate = \Helper::getRoles($input)['paginate'];
        return response()->json(['roles' => $roles,'paginate' => $paginate], 200);
    }

	public function store(Request $request)
	{  
		$input = $request->all();
		$rules = Role::$rules;
           
		$validator = Validator::make($input,$rules);
		if ($validator->fails()) {
			return response()->json(['message' => $validator->errors()], 422);
			 
		}	
        $input['slug'] = \Helper::genSlug($input['name'])['slug']; 
		Role::create($input);  
		return response()->json(['message' => 'Role Created successfully.'], 200);
		  
	}	

	public function show(Request $request,$id)
	{  
		$role = \Helper::getRoleById($id)['role'];
		if(!$role){
			return response()->json(['message' => 'Role not found'], 422);
		}
		return response()->json(['role' => $role], 200);
	}
 
    public function update(Request $request,$id)
	{    
		$input = $request->all();
		$rules = Role::$rules;
        $rules['name'] .= ',name,'.$id;   
		$validator = Validator::make($input,$rules);
		if ($validator->fails()) {
			return response()->json(['message' => $validator->errors()], 422);
			 
		}	 
        $input['slug'] = \Helper::genSlug($input['name'])['slug']; 
		$role = \Helper::getRoleById($id)['role'];
        if(!$role){
            response()->json(['message' => 'Role not found'], 422);
        }
		$role->update($input); 
        return response()->json(['message' => 'Role updated successfully.'], 200);
		  
	}
	
	public function destroy($id)
	{    
		return response()->json(['message' => 'Action Denied You do not have the necessary permissions to delete this role. Please contact an administrator if you believe this is an error.'], 422);
		$role = \Helper::getRoleById($id)['role'];
		if(!$role){
			return response()->json(['message' => 'We couldn’t find the role you’re looking for.'], 422);
		}
		 
		$role->delete();
		return response()->json(['message' => 'Role deleted successfully.'], 200);
		
	}
}