<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\SuperAdmin\PatientController as SPatientController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
 
class SendDicomDataJob implements ShouldQueue
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
		$patient->clinic->email = $patient->clinic->poc_email ?? null;

		$input['return_back'] = true;
		$newRqst = new Request($input);
		$newRqst->replace($input);

		$pController = new SPatientController;
		$pdfData = $pController->patientPdf($newRqst, $patient->id);

		$pdfContent = $pdfData['pdfContent'];
		$fileName   = $pdfData['fileName'];

		$path = 'dicom/patients/' . $patient->p_code . '/' . $fileName;

		// Save PDF
		Storage::disk('public')->put($path, $pdfContent);

		// ✅ USE REAL PATH (IMPORTANT FIX)
		$filePath = Storage::disk('public')->path($path);

		$baseName = pathinfo($fileName, PATHINFO_FILENAME); // report

		$oFileName = $baseName . '.dcm';
		$oPath = 'dicom/patients/' . $patient->p_code . '/' . $oFileName;
		 
		$outputPath = Storage::disk('public')->path($oPath);

		// Convert
		$convPdfToDicom = \Helper::convPdfTODicom($filePath, $outputPath,$patient);

		$status = 1;
		$msg = "DICOM transmission pending: file is awaiting processing.";
		
		// Debug safety
		if (!$convPdfToDicom['file_exists']) {
			
			$status = 3;
			$msg = 'DICOM conversion failed: source file not found.';
			$patient->update(['is_dicom_file_send' => $status,'dicom_file_status' => $msg]);
			if (Storage::disk('public')->exists($path)) {
				Storage::disk('public')->delete($path);
			}
			return ['status' => $status,'msg' => $msg]; 
		}
		 
		$clinic = $patient->clinic;
		// create service with clinic connection
		 
		try{
			$dicom = new \App\Services\DicomService($clinic);

			// send GET (QIDO-RS)
			// $response = $dicom->qido([
				// '0020000D' => '1.2.826.0.2.139953.3.2.1.21.56663.20240802130528386',
				  
			// ]);
			
			// send POST (STOW-RS)
			$files = [
				$outputPath, 
			];

			$response = $dicom->stow($files);
			   
			if (!empty($response['status']) && $response['status'] == 200) {
				$status = 2;
				$msg = 'DICOM conversion completed: file processed successfully.';
				$patient->update(['is_dicom_file_send' => $status,'dicom_file_sent_at' => now(),'dicom_file_status' => $msg]);
			} else{
				$status = 3;
				$msg = 'DICOM transmission failed: file could not be sent.';
				$patient->update(['is_dicom_file_send' => $status,'dicom_file_status' => $msg]);
			}
			
		}catch (\Exception $e) {
			$status = 3;
			$msg = 'DICOM transmission failed: connection error.';
			$patient->update(['is_dicom_file_send' => $status,'dicom_file_status' => $msg]);
		}
		  
		// Delete files after
		if (Storage::disk('public')->exists($path)) {
			Storage::disk('public')->delete($path);
		}

		if (Storage::disk('public')->exists($oPath)) {
			Storage::disk('public')->delete($oPath);
		}
		
		return ['status' => $status,'msg' => $msg];  
    }
}
