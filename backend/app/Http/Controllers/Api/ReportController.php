<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;

class ReportController extends Controller
{ 

	public function clinicPatient(Request $request)
	{
		$haveAccess = \Helper::permission(6,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
		
		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
        if(isset($input['reset'])){
            return redirect()->to(request()->url());
        }
		
		if(!empty($input['from_date']) && !empty($input['to_date'])){
			$validator = Validator::make($input, [
				'from_date' => ['required', 'date_format:m-d-Y', 'before_or_equal:to_date'],
				'to_date'   => ['required', 'date_format:m-d-Y'],
			]);

			if ($validator->fails()) {
				return response()->json([
					'status' => false,
					'message' => 'Validation failed',
					'errors' => $validator->errors()
				], 422);
			}
        } 
 	 
		return response()->json($this->getClinicPatientData($input), 200);  
		 
	}
	
	public function clinicPatientExport(Request $request)
	{
		$haveAccess = \Helper::permission(6,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}

		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$data = $this->getClinicPatientData($input);
		
		$patientsUploaded = $data['patientsUploaded'];
		$totalSummary = $data['totalSummary'];
		$monthlyBilling = $data['monthlyBilling'];
		$allMonths = $data['allMonths'];

		$monthlyBillingByDoctor = $data['monthlyBillingByDoctor'];

		$rows = [];
		$boldRows = [];
		$titleRows = [];

		// Section 1: Monthly Summary (Blue) - with doctor detail
		$rows[] = ['Monthly Summary'];
		$titleRows[] = ['row' => count($rows), 'color' => '4472C4'];

		$header = ['Clinic / Doctor'];
		foreach($allMonths as $month) {
			$header[] = \Carbon\Carbon::parse($month.'-01')->format("M'y");
		}
		$header[] = 'Total';
		$rows[] = $header;
		$boldRows[] = count($rows);

		$i = 1;
		foreach($patientsUploaded as $clinic => $doctors) {
			$rows[] = [$i . '. ' . $clinic];
			$boldRows[] = count($rows);

			$doctorEntries = $doctors->except('Total');
			foreach($doctorEntries as $doctorName => $count) {
				$doctorMonthData = $monthlyBillingByDoctor[$clinic][$doctorName] ?? collect();
				$row = ['   ' . $doctorName];
				$doctorTotal = 0;
				foreach($allMonths as $month) {
					$val = $doctorMonthData[$month] ?? 0;
					$row[] = $val;
					$doctorTotal += $val;
				}
				$row[] = $doctorTotal;
				$rows[] = $row;
			}

			$totalRow = [$clinic . ' - Total'];
			$clinicTotal = 0;
			foreach($allMonths as $month) {
				$val = $monthlyBilling[$clinic][$month] ?? 0;
				$totalRow[] = $val;
				$clinicTotal += $val;
			}
			$totalRow[] = $clinicTotal;
			$rows[] = $totalRow;
			$boldRows[] = count($rows);

			$rows[] = [''];
			$i++;
		}

		$grandTotalRow = ['Grand Total'];
		$grandTotal = 0;
		foreach($allMonths as $month) {
			$val = $monthlyBilling->sum(function($clinicMonths) use ($month) { return $clinicMonths[$month] ?? 0; });
			$grandTotalRow[] = $val;
			$grandTotal += $val;
		}
		$grandTotalRow[] = $grandTotal;
		$rows[] = $grandTotalRow;
		$boldRows[] = count($rows);

		$rows[] = [''];

		// Section 2: Total Summary (Green)
		$rows[] = ['Total Summary'];
		$titleRows[] = ['row' => count($rows), 'color' => '2E7D32'];

		$rows[] = ['Doctor', 'Total Patients'];
		$boldRows[] = count($rows);

		foreach($totalSummary as $doctorName => $count) {
			$rows[] = [$doctorName, $count];
			if($doctorName === 'Total') {
				$boldRows[] = count($rows);
			}
		}
		  
		$month = $input['month'] ?? ($input['from_date'] ?? 'all') . '_to_' . ($input['to_date'] ?? 'all');
		$filename = 'clinic_patient_report_' . str_replace(['/', ' ', '-'], '_', $month) . '_'.time().'.xlsx';

		$filePath = 'exports/' . $filename;

		Excel::store(
			new class($rows, $boldRows, $titleRows) implements FromArray, WithStyles {
				private $rows;
				private $boldRows;
				private $titleRows;

				public function __construct($rows, $boldRows, $titleRows)
				{
					$this->rows = $rows;
					$this->boldRows = $boldRows;
					$this->titleRows = $titleRows;
				}

				public function array(): array
				{
					return $this->rows;
				}

				public function styles(Worksheet $sheet)
				{
					$sheet->getColumnDimension('A')->setWidth(45);

					$lastCol = $sheet->getHighestColumn();
					$lastRow = $sheet->getHighestRow();

					$sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
						'borders' => [
							'allBorders' => [
								'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
								'color' => ['rgb' => '000000'],
							],
						],
					]);

					foreach ($this->titleRows as $title) {
						$row = $title['row'];

						$sheet->mergeCells("A{$row}:{$lastCol}{$row}");

						$sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
							'font' => [
								'bold' => true,
								'size' => 14,
								'color' => ['rgb' => 'FFFFFF'],
							],
							'fill' => [
								'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
								'startColor' => ['rgb' => $title['color']],
							],
							'alignment' => [
								'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
							],
						]);
					}

					foreach ($this->boldRows as $row) {
						$sheet->getStyle("A{$row}:{$lastCol}{$row}")
							->getFont()
							->setBold(true);
					}

					return [];
				}
			},
			$filePath,
			'public'
		);
	 
		return response()->json([
			'success' => true,
			'message' => 'Report generated successfully.',
			'filename' => $filename,
			'url' => \Storage::disk('public')->url($filePath),
		], 200);
	}
	
	private function getClinicPatientData($input)
	{
		$filters = [];
		$filters['paginate'] = false; 
		  
		if(!empty($input['from_date'])){
			 $filters['from_date'] = $input['from_date'];
		}
		if(!empty($input['to_date'])){
			 $filters['to_date'] = $input['to_date'];
		}
		if(!empty($input['month'])){
			 $filters['month'] = $input['month'];
		}

		if(!empty($input['clinics'])){
			$filters['r_clinic_ids'] = $input['clinics'];
		}
		 
		$patients = \Helper::getPatients(true,$filters)['patients'];
		  
		// Determine which months to show
		if(!empty($input['month'])) {
			$parsedMonth = \Carbon\Carbon::parse('01-' . $input['month'])->format('Y-m');
			$allMonths = collect([$parsedMonth]);
		} elseif(!empty($input['from_date']) || !empty($input['to_date'])) {
			$years = $patients->map(function ($patient) {
				return \Carbon\Carbon::parse($patient->created_at)->format('Y');
			})->unique()->sort();

			$allMonths = collect();
			foreach($years as $year) {
				for($m = 1; $m <= 12; $m++) {
					$allMonths->push($year . '-' . str_pad($m, 2, '0', STR_PAD_LEFT));
				}
			}
		} else {
			$currentYear = now()->format('Y');
			$allMonths = collect();
			for($m = 1; $m <= 12; $m++) {
				$allMonths->push($currentYear . '-' . str_pad($m, 2, '0', STR_PAD_LEFT));
			}
		}

		// Filter patients to only displayed months
		$filteredPatients = $patients->filter(function ($patient) use ($allMonths) {
			$patientMonth = \Carbon\Carbon::parse($patient->created_at)->format('Y-m');
			return $allMonths->contains($patientMonth);
		});

		$patientsUploaded = $filteredPatients
		->groupBy(function ($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function ($clinicPatients) {
			$doctors = $clinicPatients
				->groupBy(function ($patient) {
					if (!empty($patient->user)) {
						return trim(
							($patient->user->first_name ?? '') . ' ' .
							($patient->user->last_name ?? '') .
							' (' . ($patient->user->role->name ?? '') . ')'
						);
					}
					if (!empty($patient->study_id) || !empty($patient->dicom_json)) {
						return 'DICOM Upload (Self-Registered Patient)';
					}
					return 'Guest Registration (Self-Registered Patient)';
				})
				->map(function ($doctorPatients) {
					return $doctorPatients->count();
				});

			$doctors['Total'] = $doctors->sum();
			return $doctors;
		});

		// Month-wise billing summary per clinic
		$monthlyBilling = $filteredPatients
		->groupBy(function ($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function ($clinicPatients) {
			return $clinicPatients->groupBy(function ($patient) {
				return \Carbon\Carbon::parse($patient->created_at)->format('Y-m');
			})->map(function ($monthPatients) {
				return $monthPatients->count();
			})->sortKeys();
		});

		// Month-wise billing per clinic per doctor
		$monthlyBillingByDoctor = $filteredPatients
		->groupBy(function ($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function ($clinicPatients) {
			return $clinicPatients->groupBy(function ($patient) {
				if (!empty($patient->user)) {
					return trim(
						($patient->user->first_name ?? '') . ' ' .
						($patient->user->last_name ?? '') .
						' (' . ($patient->user->role->name ?? '') . ')'
					);
				}
				if (!empty($patient->study_id) || !empty($patient->dicom_json)) {
					return 'DICOM Upload (Self-Registered Patient)';
				}
				return 'Guest Registration (Self-Registered Patient)';
			})->map(function ($doctorPatients) {
				return $doctorPatients->groupBy(function ($patient) {
					return \Carbon\Carbon::parse($patient->created_at)->format('Y-m');
				})->map(function ($monthPatients) {
					return $monthPatients->count();
				})->sortKeys();
			});
		});

		// Total Summary
		$totalSummary = $filteredPatients
		->groupBy(function ($patient) {
			if (!empty($patient->user)) {
				return trim(
					($patient->user->first_name ?? '') . ' ' .
					($patient->user->last_name ?? '') .
					' (' . ($patient->user->role->name ?? '') . ')'
				);
			}
			if (!empty($patient->study_id) || !empty($patient->dicom_json)) {
				return 'DICOM Upload (Self-Registered Patient)';
			}
			return 'Guest Registration (Self-Registered Patient)';
		})
		->map(function ($doctorPatients) {
			return $doctorPatients->count();
		});

		$totalSummary['Total'] = $totalSummary->sum();

		$filters['paginate'] = false;
		$clinics = \Helper::getClinics(true,$filters)['clinics'];

		return compact('patientsUploaded', 'totalSummary', 'monthlyBilling', 'monthlyBillingByDoctor', 'allMonths','clinics');
	}
	
	public function orvosDoctorReview(Request $request)
	{
        $haveAccess = \Helper::permission(6,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}
			
        $input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
        if(isset($input['reset'])){
            return redirect()->to(request()->url());
        }  
		
		if(!empty($input['from_date']) && !empty($input['to_date'])){
           $validator = Validator::make($input, [
				'from_date' => ['required', 'date_format:m-d-Y', 'before_or_equal:to_date'],
				'to_date'   => ['required', 'date_format:m-d-Y'],
			]);

			if ($validator->fails()) {
				return response()->json([
					'status' => false,
					'message' => 'Validation failed',
					'errors' => $validator->errors()
				], 422);
			}
        } 
 
		return response()->json($this->getOrvosDoctorReviewData($input), 200);
    }
	
	public function orvosDoctorReviewExport(Request $request)
	{
		$haveAccess = \Helper::permission(6,'read');
		if(!$haveAccess){
			return response()->json(['message' => \Helper::permissionMsg()['message']], 404);
		}

		$input = $request->filled('data') ? json_decode($request->input('data'), true) : $request->all();
		$data = $this->getOrvosDoctorReviewData($input);
		$orvosDoctorReviews = $data['orvosDoctorReviews'];
		$totalSummary = $data['totalSummary'];
		$monthlyBilling = $data['monthlyBilling'];
		$monthlyBillingByDoctor = $data['monthlyBillingByDoctor'];
		$allMonths = $data['allMonths'];

		$rows = [];
		$boldRows = [];
		$titleRows = [];

		// Section 1: Monthly Summary (Blue) - with doctor detail
		$rows[] = ['Monthly Summary'];
		$titleRows[] = ['row' => count($rows), 'color' => '4472C4'];

		$header = ['Clinic / Doctor'];
		foreach($allMonths as $month) {
			$header[] = \Carbon\Carbon::parse($month.'-01')->format("M'y");
		}
		$header[] = 'Total';
		$rows[] = $header;
		$boldRows[] = count($rows);

		$i = 1;
		foreach($orvosDoctorReviews as $clinic => $doctors) {
			$rows[] = [$i . '. ' . $clinic];
			$boldRows[] = count($rows);

			$doctorEntries = $doctors->except('Total');
			foreach($doctorEntries as $doctorName => $count) {
				$doctorMonthData = $monthlyBillingByDoctor[$clinic][$doctorName] ?? collect();
				$row = ['   ' . $doctorName];
				$doctorTotal = 0;
				foreach($allMonths as $month) {
					$val = $doctorMonthData[$month] ?? 0;
					$row[] = $val;
					$doctorTotal += $val;
				}
				$row[] = $doctorTotal;
				$rows[] = $row;
			}

			$totalRow = [$clinic . ' - Total'];
			$clinicTotal = 0;
			foreach($allMonths as $month) {
				$val = $monthlyBilling[$clinic][$month] ?? 0;
				$totalRow[] = $val;
				$clinicTotal += $val;
			}
			$totalRow[] = $clinicTotal;
			$rows[] = $totalRow;
			$boldRows[] = count($rows);

			$rows[] = [''];
			$i++;
		}

		$grandTotalRow = ['Grand Total'];
		$grandTotal = 0;
		foreach($allMonths as $month) {
			$val = $monthlyBilling->sum(function($clinicMonths) use ($month) { return $clinicMonths[$month] ?? 0; });
			$grandTotalRow[] = $val;
			$grandTotal += $val;
		}
		$grandTotalRow[] = $grandTotal;
		$rows[] = $grandTotalRow;
		$boldRows[] = count($rows);

		$rows[] = [''];

		// Section 2: Total Summary (Green)
		$rows[] = ['Total Summary'];
		$titleRows[] = ['row' => count($rows), 'color' => '2E7D32'];

		$rows[] = ['Doctor', 'Total Patients'];
		$boldRows[] = count($rows);

		foreach($totalSummary as $doctorName => $count) {
			$rows[] = [$doctorName, $count];
			if($doctorName === 'Total') {
				$boldRows[] = count($rows);
			}
		}

		$month = $input['month'] ?? ($input['from_date'] ?? 'all') . '_to_' . ($input['to_date'] ?? 'all');
		$filename = 'orvos_doctor_review_report_' . str_replace(['/', ' ', '-'], '_', $month) . '_'.time().'.xlsx';

		$filePath = 'exports/' . $filename;

		Excel::store(
			new class($rows, $boldRows, $titleRows) implements FromArray, WithStyles {
				private $rows;
				private $boldRows;
				private $titleRows;

				public function __construct($rows, $boldRows, $titleRows)
				{
					$this->rows = $rows;
					$this->boldRows = $boldRows;
					$this->titleRows = $titleRows;
				}

				public function array(): array
				{
					return $this->rows;
				}

				public function styles(Worksheet $sheet)
				{
					$sheet->getColumnDimension('A')->setWidth(45);

					$lastCol = $sheet->getHighestColumn();
					$lastRow = $sheet->getHighestRow();

					$sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
						'borders' => [
							'allBorders' => [
								'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
								'color' => ['rgb' => '000000'],
							],
						],
					]);

					foreach ($this->titleRows as $title) {
						$row = $title['row'];

						$sheet->mergeCells("A{$row}:{$lastCol}{$row}");

						$sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
							'font' => [
								'bold' => true,
								'size' => 14,
								'color' => ['rgb' => 'FFFFFF'],
							],
							'fill' => [
								'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
								'startColor' => ['rgb' => $title['color']],
							],
							'alignment' => [
								'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
							],
						]);
					}

					foreach ($this->boldRows as $row) {
						$sheet->getStyle("A{$row}:{$lastCol}{$row}")
							->getFont()
							->setBold(true);
					}

					return [];
				}
			},
			$filePath,
			'public'
		);

		return response()->json([
			'success' => true,
			'message' => 'Report generated successfully.',
			'filename' => $filename,
			'url' => asset('storage/' . $filePath),
		], 200);
	}

	private function getOrvosDoctorReviewData($input)
	{
		$filters = [];
		$filters['paginate'] = false; 
		$filters['diagnosis_status'] = 1;
		
		if(!empty($input['from_date'])){
			 $filters['from_date'] = $input['from_date'];
		}
		if(!empty($input['to_date'])){
			 $filters['to_date'] = $input['to_date'];
		}
		if(!empty($input['month'])){
			 $filters['month'] = $input['month'];
		}

		if(!empty($input['clinics'])){
			$filters['r_clinic_ids'] = $input['clinics'];
		}
         
		$patients = \Helper::getPatients(true,$filters)['patients'];

		// Determine which months to show
		if(!empty($input['month'])) {
			$parsedMonth = \Carbon\Carbon::parse('01-' . $input['month'])->format('Y-m');
			$allMonths = collect([$parsedMonth]);
		} elseif(!empty($input['from_date']) || !empty($input['to_date'])) {
			$years = $patients->map(function ($patient) {
				return \Carbon\Carbon::parse($patient->created_at)->format('Y');
			})->unique()->sort();

			$allMonths = collect();
			foreach($years as $year) {
				for($m = 1; $m <= 12; $m++) {
					$allMonths->push($year . '-' . str_pad($m, 2, '0', STR_PAD_LEFT));
				}
			}
		} else {
			$currentYear = now()->format('Y');
			$allMonths = collect();
			for($m = 1; $m <= 12; $m++) {
				$allMonths->push($currentYear . '-' . str_pad($m, 2, '0', STR_PAD_LEFT));
			}
		}

		// Filter patients to only displayed months
		$filteredPatients = $patients->filter(function ($patient) use ($allMonths) {
			$patientMonth = \Carbon\Carbon::parse($patient->created_at)->format('Y-m');
			return $allMonths->contains($patientMonth);
		});

		$orvosDoctorReviews = $filteredPatients
		->groupBy(function($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function($clinicPatients) {
			$doctors = $clinicPatients->groupBy(function($patient) {
				return trim(
					($patient->remarkBy->first_name ?? '') . ' ' .
					($patient->remarkBy->last_name ?? '') .
					' (' . ($patient->remarkBy->role->name ?? '') . ')'
				);
			})->map(function($doctorPatients) {
				return $doctorPatients->count();
			});

			$doctors['Total'] = $doctors->sum();
			return $doctors;
		});

		$totalSummary = $filteredPatients
			->groupBy(function($patient) {
				return trim(
					($patient->remarkBy->first_name ?? '') . ' ' .
					($patient->remarkBy->last_name ?? '') .
					' (' . ($patient->remarkBy->role->name ?? '') . ')'
				);
			})
			->map(function($doctorPatients) {
				return $doctorPatients->count();
			});

		$totalSummary['Total'] = $totalSummary->sum();

		// Month-wise billing per clinic
		$monthlyBilling = $filteredPatients
		->groupBy(function ($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function ($clinicPatients) {
			return $clinicPatients->groupBy(function ($patient) {
				return \Carbon\Carbon::parse($patient->created_at)->format('Y-m');
			})->map(function ($monthPatients) {
				return $monthPatients->count();
			})->sortKeys();
		});

		// Month-wise billing per clinic per doctor
		$monthlyBillingByDoctor = $filteredPatients
		->groupBy(function ($patient) {
			return $patient->clinic->name ?? 'Unknown Clinic';
		})
		->map(function ($clinicPatients) {
			return $clinicPatients->groupBy(function ($patient) {
				return trim(
					($patient->remarkBy->first_name ?? '') . ' ' .
					($patient->remarkBy->last_name ?? '') .
					' (' . ($patient->remarkBy->role->name ?? '') . ')'
				);
			})->map(function ($doctorPatients) {
				return $doctorPatients->groupBy(function ($patient) {
					return \Carbon\Carbon::parse($patient->created_at)->format('Y-m');
				})->map(function ($monthPatients) {
					return $monthPatients->count();
				})->sortKeys();
			});
		});

		$filters['paginate'] = false;
		$clinics = \Helper::getClinics(true,$filters)['clinics'];
		return compact('orvosDoctorReviews', 'totalSummary', 'monthlyBilling', 'monthlyBillingByDoctor', 'allMonths','clinics');
	}
  
    public function getDoctorStates(Request $request)
    {
        $doctorIds = $request->input('doctor_ids', []);

        $doctors = User::with('clinicUsers', 'licenses.getState')
                    ->whereIn('id', $doctorIds)
                    ->get();

        return response()->json([
            'doctors' => $doctors
        ]);
    }

}
