<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use GuzzleHttp\Client;

class SyncDicomServerDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $patient;

    /**
     * Create a new job instance.
     */
    public function __construct($patient)
    {
        $this->patient = $patient;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        $patient = $this->patient;
		
		if (empty($patient['dicom_json'])) {
			return;
		}

		$dicomJson = $patient['dicom_json'];

		// Decode JSON into an associative array
		$dicomData = json_decode($dicomJson, true);
		

		// Check whether the JSON is valid
		if (json_last_error() !== JSON_ERROR_NONE || !is_array($dicomData)) {
			\Log::warning('Invalid DICOM JSON for patient.', [
				'patient_id' => $patient['id'] ?? null,
			]);

			return;
		}
		
		if(empty($dicomData['ID'])){
			return;
		}
		
		$studyId = $dicomData['ID'];
		
		$client = new Client();
 
		$response = $client->post(
			env('ORTHANC_ENDPOINT'). ':' .env('ORTHANC_PORT2'). '/modalities/MAIN/store',
			[
				'auth' => [
					env('ORTHANC_USERNAME2'),
					env('ORTHANC_PASSWORD2'),
				],
				'headers' => [
					'Content-Type' => 'application/json',
				],
				'body' => json_encode(
					$studyId
				),
				'timeout' => 300,         // Maximum total request time: 5 minutes
				'connect_timeout' => 10,  // Maximum time to establish the HTTP connection
			]
		);
		
		$statusCode = $response->getStatusCode();
		$responseBody = $response->getBody()->getContents();
		 
		if($statusCode == 200){
			
			\Log::info('DICOM transfer request completed.', [
				'patient_id' => $patient['id'] ?? null,
				'study_id' => $studyId,
				'status_code' => $statusCode,
	
			]);
			
			return;
		}
		
		\Log::error('DICOM transfer request failed.', [
			'patient_id' => $patient['id'] ?? null,
			'study_id' => $studyId,
			'status_code' => $statusCode,
			'response' => $responseBody,
		]);
		
		return;
		 
         
    }
}