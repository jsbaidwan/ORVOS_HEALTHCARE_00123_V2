<?php

namespace App\Jobs;

use App\Models\Patient;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateFaxDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $patientId;

    /**
     * Create a new job instance.
     */
    public function __construct($patientId)
    {
        $this->patientId = $patientId;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        $patient = Patient::find($this->patientId);

        if (!$patient) {
            Log::warning("Patient {$this->patientId} not found.");
            return;
        }

        if (empty($patient->fax_job_id)) {
            Log::warning("Patient {$patient->id} has no fax_job_id.");
            return;
        }

        try {

            $client = new Client([
                'timeout' => 30,
            ]);

            $response = $client->post('https://api.ifaxapp.com/v1/customer/fax-status', [
                'headers' => [
                    'accessToken' => env('FAX_ACCESS_TOKEN'),
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'jobId' => $patient->fax_job_id,
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
			 
            if (!empty($result['data'])) {
				
				$data = $result['data'];
				$faxStatus = 3;
				if($data['faxStatus']  == 'delivered'){
					$faxStatus = 2;
				} 
			
                $patient->update([
                    'fax_status'  => $faxStatus ?? $patient->fax_status,
                    'fax_sent_at' => now(),
                    'fax_json'    => json_encode($data),
                ]);

                Log::info("Patient {$patient->id} fax updated successfully.");
            }

        } catch (\Throwable $e) {

            Log::error("Patient {$patient->id} Fax Update Failed: ".$e->getMessage());

            // Re-throw so Laravel can retry according to your queue settings.
            throw $e;
        }
    }
}