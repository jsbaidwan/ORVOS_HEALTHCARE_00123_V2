<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Session; 
use Validator;
use Hash;
use Event;
use App\Http\Controllers\Controller;
use App\Models\PdfTemplate;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
  
class PdfTemplateController extends Controller
{ 
	public function index(Request $request)
	{
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$haveAccess = \Helper::permission(7,'create');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		 
		$pdfTemplates = \Helper::getPdfTemplates($input)['pdfTemplates'];
		return response()->json(['pdfTemplates' => $pdfTemplates], 200); 
		  
	}
	
	public function store(Request $request)
	{
		$haveAccess = \Helper::permission(7,'create');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$input['pdf_template_category_id'] = $input['category_id'];
		$rules = PdfTemplate::rules(null,\Auth::user()->id);
		$messages = PdfTemplate::messages();
  
        $validate = Validator::make($input,$rules,$messages);
        if($validate->fails()){
            
            return response()->json(['errors' => $validate->errors()], 422);
        }
		
		$input['user_id'] = \Auth::user()->id;
		PdfTemplate::create($input);
		
		return response()->json(['message' => 'Pdf Template created successfully'], 200);
		 
	}
	public function edit($id)
	{
		$haveAccess = \Helper::permission(7,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$pdfTemplate = \Helper::getPdfTemplateById($id)['pdfTemplate'];
		if(!$pdfTemplate){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		return response()->json(['pdfTemplate' => $pdfTemplate], 200);
	}
	
	public function update(Request $request,$id)
	{ 
		$haveAccess = \Helper::permission(7,'write');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$input['pdf_template_category_id'] = $input['category_id'];
		$rules = PdfTemplate::rules($id,\Auth::user()->id);
		$messages = PdfTemplate::messages();
  
        $validate = Validator::make($input,$rules,$messages);
        if($validate->fails()){
             return response()->json(['errors' => $validate->errors()], 422);
             
        }
		 
		$pdfTemplate = \Helper::getPdfTemplateById($id)['pdfTemplate'];
		if(!$pdfTemplate){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$pdfTemplate->update($input);
		  
		return response()->json(['message' => 'Pdf Template updated successfully'], 200);
 
	}
	
	public function show($id)
	{
		$haveAccess = \Helper::permission(7,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$pdfTemplate = \Helper::getPdfTemplateById($id)['pdfTemplate'];
		if(!$pdfTemplate){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$body = $pdfTemplate->body;

		// Convert images to server path first
		$htmlBody = \Helper::convertToServerPath($body);
 
		// Combine in correct order: Body first, CSS overrides after
		$html = $htmlBody;
 
		// mPDF setup
		$mpdf = new Mpdf([
			'mode' => 'utf-8',
			'format' => 'A4',
			 
		]);

		$mpdf->showImageErrors = false;
		// ✅ Set PDF title (can be dynamic)
		$mpdf->SetTitle($pdfTemplate->name.' - '.$pdfTemplate['clinic']['name'] ?? 'PDF Preview');
		$mpdf->WriteHTML($html);

		return response($mpdf->Output('', 'S'))
			->header('Content-Type', 'application/pdf')
			->header('Content-Disposition', 'inline; filename="preview.pdf"');
		 
	}
	 
}