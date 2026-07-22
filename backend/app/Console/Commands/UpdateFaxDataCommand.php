<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\UpdateFaxDataJob;

class UpdateFaxDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fax:update {id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch iFax data from ifaxapp.com and update patient fax status';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $patientId = $this->argument('id');

        $filters = [
            'paginate' => false,
            'diagnosis_status' => 1,
            'fax_status' => 1,
        ];

        if ($patientId) {

            $patient = \Helper::getPatientById($patientId);

            if (empty($patient['patient'])) {
                $this->error('Patient not found.');
                return Command::FAILURE;
            }

            $patients = [$patient['patient']];

        } else {

            $patients = \Helper::getPatients($filters)['patients'] ?? [];
        }

		
        if (empty($patients)) {
            $this->info('No patients found.');
            return Command::SUCCESS;
        }

        foreach ($patients as $patient) {

            if (empty($patient['fax_job_id'])) {
                $this->warn("Skipping Patient {$patient['id']} - fax_job_id missing.");
                continue;
            }

            UpdateFaxDataJob::dispatch($patient['id'])
                ->onQueue('update-fax-data');
        }
 
        $this->info(count($patients).' jobs dispatched successfully.');

        return Command::SUCCESS;
    }
}