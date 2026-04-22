<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Api\PatientController as ApiPatientController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
 
class SendFaxReportToClinicJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $patient;

    public function __construct($patient)
    {
        $this->patient = $patient;
    }

    public function handle()
    { 
		sleep(5);
		$patient = $this->patient;
        $patient->clinic->email = $patient->clinic->poc_email ?? NULL; 
		  
		$input['return_back'] = true;
		$newRqst = new Request($input);
        $newRqst->replace($input);
		
		$pController = new ApiPatientController;
		$pdfData = $pController->patientPdf($newRqst, $patient->id);

		$pdfContent  = $pdfData['pdfContent'];
		$fileName = $pdfData['fileName'];	
		
		$path = 'faxes/patients/' . $patient->p_code.'/'.$fileName;
		
		Storage::disk('public')->put($path, $pdfContent);
		
		// Public URL for fax
		$fileUrl = Storage::disk('public')->url($path);
 
		$data = [
			'fax_number' => ($patient->clinic->fax_number ?? NULL),
			'message' => 'Hello ' . ($patient->clinic->name ?? 'Clinic') . ', Please find the attached patient diagnosis report.',
			'first_name' => ($patient->first_name ?? NULL),
			'last_name' => ($patient->last_name ?? NULL),
			'file_name' => $fileName,
			'file_url' => $fileUrl,
		];
		
		$sendFax = \Helper::faxSend($data);
		 
		$faxStatus = 1;
		if(isset($sendFax['status']) && $sendFax['status'] == 0){
			$faxStatus = 3;
		}
		
		$faxJobId = $sendFax['data']['jobId'] ?? NULL;
		if(!empty($sendFax['data']['faxStatus'])){
			$faxJobId = $sendFax['data']['jobId'];
			if($sendFax['data']['faxStatus'] == 'delivered'){
				$faxStatus = 2;
			}else if($sendFax['data']['faxStatus'] == 'failed'){
				$faxStatus = 3;
			}
		} 
		
		$patient->update(['fax_status' => $faxStatus,'fax_job_id' => $faxJobId,'fax_sent_by' => $patient->remark_by ?? 0 ,'fax_sent_at' => now(),'fax_json' => json_encode($sendFax)]);
		
		// Delete after fax
		Storage::disk('public')->delete($path);
		
		return ['fax_status' => $faxStatus,'fax_job_id' => $faxJobId];
  
    }
}
