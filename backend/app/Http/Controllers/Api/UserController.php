<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Validation\Rule;
use App\Notifications\SignUpMail;
use Illuminate\Support\Str;
  
class UserController extends Controller
{ 
	public function index(Request $request)
	{	
		$input = $request->all();
		 
		$users = \Helper::getUsers($input)['users']; 
		$paginate = \Helper::getUsers($input)['paginate'];
		return response()->json(['users' => $users,'paginate' => $paginate], 200);
		 
	}
	
	public function store(Request $request)
	{	
		$input = $request->all(); 
		$rules = User::$rules;
		unset($rules['company_ids']);
		unset($rules['password']);
		$messages = User::$messages;
		$validator = Validator::make($input, $rules,$messages);
		 
		if ($validator->fails()) { 
			return response()->json(['message' => $validator->errors()], 422);
		 
		}
		$input['username'] = \Helper::getUserName($input['first_name'].' '.$input['last_name'])['username']; 
		if(!empty($input['image'])){
			$file = $input['image'];
			$username = $input['username']; // Ensure folder name is safe

			// Remove spaces from the original file name
			$originalName = str_replace(' ', '_', $file->getClientOriginalName());

			// Or fully sanitize the file name
			$filename = time() . '_' . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $originalName);

			$path = 'uploads/users/' . $username;

			$file->move(public_path($path), $filename);

			// Set sanitized filename to input
			$input['image'] = $filename;
			
		}
		
		$input['timezone'] = \Helper::getTimeZoneFromIp()['timezone'];
		$input['country_code'] = \Helper::getTimeZoneFromIp()['countryCode'];
		 
		$password = Str::random(8);
		$input['password'] = $password;
		$user = User::create($input);
		
		if(!empty($input['documents'])){
			$documents = $input['documents'];
			 
			 foreach ($documents as $index => $value) {
				$document = json_decode($value,true);
				$document['user_id'] = $user->id;
				if(!empty($document['id'])){
					
					if(!empty($request->file('document_files'))){
					
						if(isset($request->file('document_files')[$index])){
							 
							$file = $request->file('document_files')[$index];
							$username = $input['username'];
							$originalName = str_replace(' ', '_', $file->getClientOriginalName());
							$filename = time() . '_' . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $originalName);

							$path = 'uploads/users/' . $username .'/documents';

							$file->move(public_path($path), $filename);
							$document['doc_file'] = $filename;
							  
							UserDocument::create($document);
						}
					} else{
			
						UserDocument::updateOrCreate(
							['user_id' => $document['user_id'], 'id' => $document['id']],
							$document
						);
					}
				} 
			}
		}
		
		$appUrl = NULL;
		if(!empty($input['app_url'])){
			$appUrl = $input['app_url'];
		}
		$user->notify(new SignUpMail($password, $appUrl));
		return response()->json(['user' => $user,'message' => 'User created successfully.'], 200);
	}
	
	public function update(Request $request,$id)
	{	
		$input = $request->all(); 
		 
		$rules = User::$rules;
		$rules['email'] = [Rule::unique('users')->ignore($id)];
		$rules['username'] = [Rule::unique('users')->ignore($id)];
		unset($rules['company_ids']);
		unset($rules['password']);
		$messages = User::$messages;
		$validator = Validator::make($input, $rules,$messages);
		 
		if ($validator->fails()) { 
			return response()->json(['message' => $validator->errors()], 422);
		 
		}
		$user = \Helper::getUserById($id)['user'];
		if(!$user){
			return response()->json(['message' => 'We couldn’t find the user you’re looking for.'], 404);
		}
		  
		 
		// Check if slug changed
		if ($user->username !== $input['username']) {
			$oldPath = public_path('uploads/users/' . $user->username);
			$newPath = public_path('uploads/users/' . $input['username']);

			if (is_dir($oldPath)) {
				// Rename directory
				rename($oldPath, $newPath);
			}
		}
		if(is_string($input['image'])){
			unset($input['image']);
		}
		if(!empty($request->file('image'))){
			 
			$oldImage = $user->image['name'];
			$filePath = public_path('uploads/users/'.$input['username'].'/'.$oldImage);
			 
			if(!empty($oldImage) && file_exists($filePath)){
				@unlink($filePath);
			}
			
			$file = $input['image'];
			$username = $input['username']; // Ensure folder name is safe

			// Remove spaces from the original file name
			$originalName = str_replace(' ', '_', $file->getClientOriginalName());

			// Or fully sanitize the file name
			$filename = time() . '_' . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $originalName);

			$path = 'uploads/users/' . $username;

			$file->move(public_path($path), $filename);

			// Set sanitized filename to input
			$input['image'] = $filename;
			
		}
		if(!empty($input['remove_image'])){
			$oldImage = $user->image['name'];
			$filePath = public_path('uploads/users/'.$input['username'].'/'.$oldImage);
			if(!empty($oldImage) && file_exists($filePath)){
				@unlink($filePath);
			}
		}
		  
		if(!empty($input['documents'])){
			$documents = $input['documents'];
			 
			 foreach ($documents as $index => $value) {
				$document = json_decode($value,true);
				$document['user_id'] = $user->id;
				if(!empty($document['id'])){
					 
					if(!empty($request->file('document_files'))){
					
						if(isset($request->file('document_files')[$index])){
							 
							$file = $request->file('document_files')[$index];
							$username = $input['username'];
							$originalName = str_replace(' ', '_', $file->getClientOriginalName());
							$filename = time() . '_' . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $originalName);

							$path = 'uploads/users/' . $username .'/documents';

							$file->move(public_path($path), $filename);
							$document['doc_file'] = $filename;
							  
							UserDocument::create($document);
						}
					} else{
			
						UserDocument::updateOrCreate(
							['user_id' => $document['user_id'], 'id' => $document['id']],
							$document
						);
					}
				} 
			}
		}
		
		if (!empty($input['document_removed_ids']) && is_array($input['document_removed_ids'])) {

			$docIds = $input['document_removed_ids'];
			$documentsToDelete = $user->documents()->whereIn('id', $docIds)->get();

			if ($documentsToDelete->isNotEmpty()) {
				foreach ($documentsToDelete as $doc) {
					// Unlink the file from the folder
					if (!empty($doc->doc_file) && !empty($user->username)) {
						$filePath = public_path('uploads/users/' . $user->username . '/documents/' . $doc->doc_file);
						if (file_exists($filePath)) {
							unlink($filePath);
						}
					}

					// Delete the document record
					$doc->delete();
				}
			}
		}
		if(!empty($user['companies'])){
			unset($user['companies']); 
		}
		 
		$user->update($input);
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
		 
		$filePath = public_path('uploads/users/'.$user['username'].'/'.$image);
		 
		if(!empty($image) && file_exists($filePath)){
			@unlink($filePath);
			$dirPath = public_path('uploads/users/'.$user['username']);
			@rmdir($dirPath);
			
		}
		$user->delete();
		return response()->json(['message' => 'User deleted successfully.'], 200);
		
	}
	
}