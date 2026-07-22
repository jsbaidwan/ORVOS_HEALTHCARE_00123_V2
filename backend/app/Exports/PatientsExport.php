<?php
namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Maatwebsite\Excel\Concerns\WithEvents;

class PatientsExport implements FromCollection, WithHeadings, WithCustomCsvSettings,WithEvents
{
    protected $patients;
	
	public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Wrap text for the Diagnosis Details column
                // Assuming 'Diagnosis Details' is column P (16th column)
                $sheet->getStyle('P1:P'.$sheet->getHighestRow())
                      ->getAlignment()
                      ->setWrapText(true);

                // Optional: Auto-size all columns
                foreach(range('A','P') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            },
        ];
    }
	
	public function getCsvSettings(): array
    {
        return [
            'delimiter' => ',',   // comma separated
            'enclosure' => '"',
            'line_ending' => "\r\n", // Windows line endings
            'use_bom' => true,    // important for Excel
        ];
    }

    public function __construct($patients)
    {
        $this->patients = $patients;
    }

    public function collection()
    {
		
        return collect($this->patients)->map(function ($patient) {
			
			$examTest = $patient['remark_result'];
			$isTed = (string) ($patient['screening_type_id'] ?? '') === '2';
			$leftEyeDiagnosisDetails = '';
			
			if (!empty($examTest['exam_data']['leftEye']))
			{
				if ($isTed && !is_array($examTest['exam_data']['leftEye'])) {
					$ted = \Helper::tedDiseaseById($examTest['exam_data']['leftEye']);
					$leftEyeDiagnosisDetails = ($ted['status'] ?? null) === 200
						? htmlspecialchars($ted['tedDisease']['name'])
						: '-';
				} else {
					foreach($examTest['exam_data']['leftEye'] as $eKey => $eData)
					{ 
						$examTypeData = \Helper::getExamTypeById($patient['medical_condition_id'], $eData['exam_type'] ?? '','leftEye');
						 
						if($examTypeData['status'] === 200 && $examTypeData['examType'])
						{
							$leftEyeDiagnosisDetails .= htmlspecialchars($examTypeData['examType']['name']) 
							 .':-' 
							 . htmlspecialchars($examTypeData['examType']['code']) 
							 . ",\r\n";

						} 
						 
					}
				}
			} else {
				$leftEyeDiagnosisDetails .= '-'; 
			}
			
			$rightEyeDiagnosisDetails = '';
			
			if (!empty($examTest['exam_data']['rightEye']))
			{
				if ($isTed && !is_array($examTest['exam_data']['rightEye'])) {
					$ted = \Helper::tedDiseaseById($examTest['exam_data']['rightEye']);
					$rightEyeDiagnosisDetails = ($ted['status'] ?? null) === 200
						? htmlspecialchars($ted['tedDisease']['name'])
						: '-';
				} else {
					foreach($examTest['exam_data']['rightEye'] as $eKey => $eData)
					{ 
						$examTypeData = \Helper::getExamTypeById($patient['medical_condition_id'], $eData['exam_type'] ?? '','rightEye');
						  
						if($examTypeData['status'] === 200 && $examTypeData['examType'])
						{
							$rightEyeDiagnosisDetails .= htmlspecialchars($examTypeData['examType']['name']) 
							 .':-'  
							 . htmlspecialchars($examTypeData['examType']['code']) 
						 . ",\r\n";

					} 
					 
				}
				}
			} else {
				$rightEyeDiagnosisDetails .= '-'; 
			}
				 				
            return [
				'Created At' => $patient['formated_created_at'] ?? '-',
                'Diagnosis Status' => ucwords(\Helper::getPatientDiagnosisStatusById($patient->diagnosis_status)['pStatus']['name']),
                'Patient Code' => $patient->p_code,
				'Gender' => $patient->gender ? ucwords(\Helper::getGenderById($patient->gender)['gender']['name']) : '-' ,
                'Remark Status' => ucwords(\Helper::getPatientRemarkStatusById($patient->remark_status)['pStatus']['name']),
                'Remark' => $examTest['remark'] ?? '-',
				'Remark By' => $patient->remarkBy ? ucwords($patient->remarkBy['first_name']) . ' ' . ucwords($patient->remarkBy['last_name']) : '-',
				'DOS' => \Helper::dateFormat($patient->dos)['date'] ?? '',
				'Remark At' => \Helper::dateFormat($patient->remark_at)['date'] ?? '',
                'Posted By' => $patient->postedBy ? ucwords($patient->postedBy['first_name']) . ' ' . ucwords($patient->postedBy['last_name']) : '-',
                'EHR#' => $patient->ehr,
                'DOB' => \Helper::dateFormat($patient->dob)['date'],
                'Clinic' => $patient->clinic->name,
                'First Name' => ucwords($patient->first_name),
                'Last Name' => ucwords($patient->last_name),
                'Insurance Name' => $patient->p_insurance_name,
                'Insurance Group No' => $patient->p_insurance_group_no,
                'Insurance Member No' => $patient->p_insurance_member_no,
                'Phone' => $patient->phone ?: '-',
                'Address' => trim($patient->address) ?: '-',
				'Follow Up' => ucwords(\Helper::getFollowUpStatusById($patient['follow_up'])['fStatus']['name'] ?? '-') ?? '-',
				'Left Eye Diagnosis Details' => $leftEyeDiagnosisDetails,
				'Right Eye Diagnosis Details' => $rightEyeDiagnosisDetails,
				
            ];
        });
    }

    public function headings(): array
    {
        return [
			'Created At',
            'Diagnosis Status',
            'Patient Code',
			'Gender',
            'Remark Status',
			'Remark',
            'Remark By',
			'DOS',
			'Remark At',
            'Posted By',
            'EHR#',
            'DOB',
            'Clinic',
            'First Name',
            'Last Name',
            'Insurance Name',
            'Insurance Group No',
            'Insurance Member No',
            'Phone',
            'Address',
			'Follow Up',
			'Left Eye Diagnosis Details',
			'Right Eye Diagnosis Details',
			
        ];
    }
	 
}
