<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\PatientController as ApiPatientController;

class ClinicPatientReportMail extends Notification
{
    use Queueable;

    public $patients;

    public function __construct($patient)
    {
        $this->patient = $patient;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {  
		$patient = $this->patient;
		
		$input['return_back'] = true;
		$input['hasPassword'] = true;
		$newRqst = new Request($input);
        $newRqst->replace($input);
		
		$pController = new ApiPatientController;
		$pdfData = $pController->patientPdf($newRqst, $patient->id);
		  
		$pdfContent  = $pdfData['pdfContent'];
		$fileName = $pdfData['fileName'];	
		  
        $mail = (new MailMessage)
		->subject('Patient Diagnosis Report - ' . $patient->first_name . ' ' . $patient->last_name)
		->greeting('Hi. ' . $notifiable->name)
		->line('A new patient has been diagnosed by **' . (($patient->remarkBy->first_name ?? '-') . ' ' . ($patient->remarkBy->last_name ?? '-'))
		. '**. Please find the details below:')
		->line('**Patient Name:** ' . ($patient->first_name ?? '') . ' ' . ($patient->last_name ?? ''))
		->line('**Patient Code:** ' . ($patient->p_code ?? '-'))
		->line('**Patient Email:** ' . ($patient->email ?? '-'))
		->line('')
		->line('The detailed report is attached as a PDF.')
		->line('**Please note:** The PDF is password-protected. The password of the PDF is your clinic code, e.g., **CLI-xxx**.')
		->line('')
		->line('If you have any questions or need assistance, please feel free to contact us.')
		->attachData($pdfContent, $fileName, [
			'mime' => 'application/pdf',
		]);
		 
		$patient->update(['is_report_sent' => 1,'report_sent_by' => $patient->remark_by ?? 0,'report_sent_at' => now()]); 
		return $mail;
			 
    }
}
