@if(!empty($hasPdfTempByCliniId))
	<style>

		.badge {
			display: inline-block !important;
			padding: 3px 6px !important;
			font-size: 12px !important;
			font-weight: bold !important;
			border-radius: 4px !important;
		}
		.badge-danger { color: #fff !important; background-color: #f62d51 !important; }
		.badge-warning { color: #fff !important; background-color: #ffbc34 !important; }
		.badge-light { color: #000 !important; background-color: #d1d6dba6 !important; }
		.badge-success { color: #fff !important; background-color: #28a745 !important;}
		
		img { max-width: 100% !important; height: auto !important; }
		
		.image-style-align-left {
			float: left !important;
			margin-right: 10px !important;
			width: 40% !important;
		}
		.image-style-align-right {
			float: right !important;
			margin-left: 10px !important;
			width: 40% !important;
		}
		.image-style-align-center {
			display: block !important;
			margin: 0 auto !important;
			text-align: center !important;
		}
		th, td { width: 50% !important; border: 1px solid #000 !important; padding: 10px !important; vertical-align: top !important; }
	</style>
	 {!! $pdfTemplate['body'] !!}
	 
@elseif((string) $patient->screening_type_id === '1')

	<!DOCTYPE html>

	<html>

	<head>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Patient Report</title>

		<style>
		.badge {
			display: inline-block !important;
			padding: 3px 6px !important;
			font-size: 12px !important;
			font-weight: bold !important;
			border-radius: 4px !important;
		}
		.badge-danger { color: #fff !important; background-color: #f62d51 !important; }
		.badge-warning { color: #fff !important; background-color: #ffbc34 !important; }
		.badge-light { color: #000 !important; background-color: #d1d6dba6 !important; }
		.badge-success { color: #fff !important; background-color: #28a745 !important;}
		
		img { max-width: 100% !important; height: auto !important; }
		
		.image-style-align-left {
			float: left !important;
			margin-right: 10px !important;
			width: 40% !important;
		}
		.image-style-align-right {
			float: right !important;
			margin-left: 10px !important;
			width: 40% !important;
		}
		.image-style-align-center {
			display: block !important;
			margin: 0 auto !important;
			text-align: center !important;
		}
		th, td { width: 50% !important; border: 1px solid #000 !important; padding: 10px !important; vertical-align: top !important; }
		 
		</style>
	</head>

	<body>

	@php
		$clinicImage = \Helper::getClinicImage($patient->clinic->id);
		$clinicLogo = $clinicImage['pdf_path'] ?? null;
		$logo = public_path('assets/images/1757501387_OrvosTransparentLogo1.png');
		if (!file_exists($logo)) {
			$logo = asset('assets/images/1757501387_OrvosTransparentLogo1.png');
		}
	@endphp

	{{-- Header Logo --}}
	@if (!empty($clinicLogo))
		<div style="text-align:center;">
			<img src="{{ $clinicLogo }}" style="width:300px;">
		</div>
	@else
		<pre style="text-align:center;"><img src="{{ $logo }}" style="width: 300px;" class="fr-fic fr-dib"></pre>
	@endif

	<hr>

	{{-- Patient Basic Info --}}
	<p>
		<span style="font-size:18px;">
			<strong>EHR:</strong> {{ $patient->ehr }}
		</span><br>

		<span style="font-size:24px;">
			<strong>Patient Name:</strong>
			{{ ucwords($patient->first_name) }} {{ ucwords($patient->last_name) }}
		</span>
	</p>

	<p style="font-size:12px;">
		<strong>Patient DOS:</strong>
		{{ \Helper::dateFormat($patient->dos)['date'] }}<br>

		<strong>Patient DOB:</strong>
		{{ $patient->date_of_birth ?? $patient->dob }}<br>

		<strong>Patient Gender:</strong>
		{{ $patient->gender ? ucwords(\Helper::getGenderById($patient->gender)['gender']['name']) : '-' }}<br>

		<strong>Patient Condition:</strong>
		({{ \Helper::getMedicalConditionById($patient->medical_condition_id)['medicalCondition']['name'] ?? '-' }})<br>

		<strong>Patient History:</strong>
		@foreach(\Helper::getMedicalHistoryById($patient->medical_history)['medical_history'] as $value)
			{{ $value['name'] }}@if(!$loop->last), @endif
		@endforeach
		<br>

		<strong>Patient Notes:</strong>
		{{ $patient->note ?? '-' }}
	</p>

	<hr>

	{{-- Eye Images --}}
	<table style="width: 100%; border-collapse: collapse; border-width: 0px; border-style: solid; float: left; border-color: rgb(255, 255, 255); height: 64px;" border="1">
		<tr style="height: 63px;">
			<td data-cell-padding="10px" style="padding: 10px; width: 50%; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;" data-cell-width="50%">
				<strong>Left Eye:</strong><br><br>
				<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;">
					<tr>
						
						@if(!empty($patient->l_eye_images))
							@foreach($patient->display_left_eye_images as $key => $file)
								<td width="33%" align="center" valign="top" >
									<img src="{{ $file['src'] }}" width="100" height="100">
									<small>Image ({{$key + 1}}) </small>
								</td>
							@endforeach
						@else
							-
						@endif
						
					</tr>
				</table>
			</td>

			<td data-cell-padding="10px" style="padding: 10px; width: 50%; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;" data-cell-width="50%">
				<strong>Right Eye:</strong><br><br>
				<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;">
					<tr>
						
						@if(!empty($patient->r_eye_images))
							
							@foreach($patient->display_right_eye_images as $key => $file)
								<td width="33%" align="center" valign="top" >
									<img src="{{ $file['src'] }}" width="100" height="100">
									<small>Image ({{$key + 1}}) </small>
								</td>
							@endforeach
							
						@else
							-
						@endif
						
					</tr>
				</table>
			</td>
		</tr>

		{{-- Diagnosis Details --}}
		<tr style="height: 63px;">
			<td data-cell-padding="10px" style="padding: 10px; width: 50%; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;" data-cell-width="50%">
				<strong>Left Eye Diagnosis Details:</strong><br>
				@php $exam = is_array($patient->remark_result) ? $patient->remark_result : json_decode($patient->remark_result, true); @endphp
				@if(!empty($exam['exam_data']['leftEye']) && is_array($exam['exam_data']['leftEye']))
					@foreach($exam['exam_data']['leftEye'] as $e)
						@php
							$examTypeData = \Helper::getExamTypeById(
								$patient->medical_condition_id,
								$e['exam_type'] ?? '',
								'leftEye'
							);
						@endphp
						{{ $examTypeData['examType']['name'] ?? '-' }} {{ !empty($examTypeData['examType']['code']) ? '(' . $examTypeData['examType']['code'] . ')' : '' }}<br>
					@endforeach
				@else
					-
				@endif
			</td>

			<td data-cell-padding="10px" style="padding: 10px; width: 50%; vertical-align: top; border-width: 1px; border-style: solid; text-align: center;" data-cell-width="50%">
				<strong>Right Eye Diagnosis Details:</strong><br>
				@if(!empty($exam['exam_data']['rightEye']) && is_array($exam['exam_data']['rightEye']))
					@foreach($exam['exam_data']['rightEye'] as $e)
						@php
							$examTypeData = \Helper::getExamTypeById(
								$patient->medical_condition_id,
								$e['exam_type'] ?? '',
								'rightEye'
							);
						@endphp
						{{ $examTypeData['examType']['name'] ?? '-' }} {{ !empty($examTypeData['examType']['code']) ? '(' . $examTypeData['examType']['code'] . ')' : '' }}<br>
					@endforeach
				@else
					-
				@endif
			</td>
		</tr>
	</table>

	{{-- Notes --}}
	<p style="font-size:12px;">
		<strong>Diagnosis Notes:</strong><br>
		{{ $exam['remark'] ?? '-' }}<br><br>

		<strong>Follow Up:</strong><br>
		@if(\Helper::getFollowUpStatusById($patient->follow_up)['status'] == 200)
			<span class="badge badge-{{\Helper::getFollowUpStatusById($patient['follow_up'])['fStatus']['class']}}">
			{{ \Helper::getFollowUpStatusById($patient->follow_up)['fStatus']['name'] }}
			</span>
		@else
			-
		@endif
	</p>

	{{-- Doctor Info --}}
	<p style="font-size:12px;">
		<strong>Orvos Doctor:</strong>
		{{ $patient->remarkBy->first_name ?? '' }} {{ $patient->remarkBy->last_name ?? '' }}<br>

		<strong>NPI Number:</strong>
		{{ $patient->remarkBy->npi_number ?? '-' }}<br><br>
		
		@php
		$sigImg = '<span></span>';
		if(!empty($patient->remarkBy->signature)){
			$sigImg = '<img src="' . ($patient['remarkBy']['display_signature']['src'] ?? '') . '" style="max-height:50px; width:100%;">';
		}
		@endphp
		
		{!! $sigImg !!}  
		<br>
		<strong>Signature</strong>
	</p>

	{{-- Footer Logo --}}
	 
	<p style="text-align:right;">
		<img src="{{ asset('assets/images/1757501387_OrvosTransparentLogo1.png') }}" style="width:230px;">
	</p>
	 

	</body>

</html>

	 
@elseif((string) $patient->screening_type_id === '2')

	<!DOCTYPE html>

	<html>

	<head>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Thyroid Eye Disease Diagnosis Report</title>

		<style>
		.badge {
			display: inline-block !important;
			padding: 3px 6px !important;
			font-size: 12px !important;
			font-weight: bold !important;
			border-radius: 4px !important;
		}
		.badge-danger { color: #fff !important; background-color: #f62d51 !important; }
		.badge-warning { color: #fff !important; background-color: #ffbc34 !important; }
		.badge-light { color: #000 !important; background-color: #d1d6dba6 !important; }
		.badge-success { color: #fff !important; background-color: #28a745 !important;}

		img { max-width: 100% !important; height: auto !important; }

		.cas-box td { border: 1px solid #cccccc !important; padding: 6px !important; font-size: 12px !important; font-family: Arial, Helvetica, sans-serif !important; }
		.checkbox-box { border:1px solid #333333; padding:1px 7px; }
		
		th, td { width: 50% !important; border: 1px solid #000 !important; padding: 10px !important; vertical-align: top !important; }
		</style>
	</head>

	<body>

	@php
		$clinicImage = \Helper::getClinicImage($patient->clinic->id);
		$clinicLogo = $clinicImage['pdf_path'] ?? null;
		$exam = is_array($patient->remark_result) ? $patient->remark_result : json_decode($patient->remark_result, true);
		$rawCas = $patient->cas_questions;
		$casAnswers = is_array($rawCas) ? $rawCas : (!empty($rawCas) ? json_decode($rawCas, true) : []);
		$logo = public_path('assets/images/1757501387_OrvosTransparentLogo1.png');
		if (!file_exists($logo)) {
			$logo = asset('assets/images/1757501387_OrvosTransparentLogo1.png');
		}
	@endphp

	{{-- Header Logo --}}
	@if (!empty($clinicLogo))
		<div style="text-align:center;">
			<img src="{{ $clinicLogo }}" style="width:230px;">
		</div>
	@else
		
		<pre style="text-align:center;"><img src="{{ $logo }}" style="width: 230px;" class="fr-fic fr-dib"></pre>
	@endif

	<hr>

	{{-- Patient Basic Info --}}
	<p>
		<span style="font-size:18px;">
			<strong>EHR:</strong> {{ $patient->ehr }}
		</span><br>

		<span style="font-size:24px;">
			<strong>Patient Name:</strong>
			{{ ucwords($patient->first_name) }} {{ ucwords($patient->last_name) }}
		</span>
	</p>

	<p style="font-size:12px;">
		<strong>Patient DOS:</strong>
		{{ \Helper::dateFormat($patient->dos)['date'] }}<br>

		<strong>Patient DOB:</strong>
		{{ $patient->date_of_birth ?? $patient->dob }}<br>

		<strong>Patient Gender:</strong>
		{{ $patient->gender ? ucwords(\Helper::getGenderById($patient->gender)['gender']['name']) : '-' }}<br>

		<strong>Patient Condition:</strong>
		({{ \Helper::getMedicalConditionById($patient->medical_condition_id)['medicalCondition']['name'] ?? '-' }})<br>

		<strong>Patient History:</strong>
		@foreach(\Helper::getMedicalHistoryById($patient->medical_history)['medical_history'] as $value)
			{{ $value['name'] }}@if(!$loop->last), @endif
		@endforeach
		<br>

		<strong>Patient Notes:</strong>
		{{ $patient->note ?? '-' }}
	</p>

	<hr>

	{{-- Images (left) + Diagnosis & CAS (right) --}}
	
	<table style="width: 100%; margin: auto; border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0); height: 300px;" class="light-bordered">
		<colgroup>
			<col style="width: 50.0000%;">
				<col style="width: 50.0000%;">
		</colgroup>
		<tbody>
			<tr style="height: 83.6667px;">
				<td class="padding " data-cell-padding="10" style="padding: 10px;">

					<p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; margin-bottom: 4px;" data-pasted="true"><strong>Right Eye</strong>
						 
						<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;">
							<tr style="height: 63px">
								@if(!empty($patient->r_eye_images) && !empty($patient->display_right_eye_images))
									@php $rightEyesArr = $patient->display_right_eye_images; @endphp
									@if(count($rightEyesArr) == 1)<td style="border:0;"></td>@endif
									@foreach($rightEyesArr as $key => $file)
										<td class="padding " data-cell-padding="10" style="padding: 10px;">
											<img src="{{ $file['src'] }}" width="100" height="100" style="border:1px solid #cccccc; padding:2px;">
											<div><small>Image {{ $key + 1 }}</small></div>
										</td>
									@endforeach
									@if(count($rightEyesArr) == 1)<td style="border:0;"></td>@endif
								@endif
							</tr>
						</table>	
					</p>
				</td>
				<td rowspan="3" style="text-align: left; padding: 10px; vertical-align: top;" data-cell-padding="10">

					<p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; margin: 8px 0 4px 0;" data-pasted="true"><strong>CAS Questions</strong></p>
					
					<table class="cas-box" width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; border:1px solid #cccccc;">
						 
						<tr>
							<td style="padding:6px; border:1px solid #cccccc; font-family:Arial,Helvetica,sans-serif; font-size:12px;"><strong>Question</strong></td>
							<td style="padding:6px; border:1px solid #cccccc; font-family:Arial,Helvetica,sans-serif; font-size:12px; text-align:center; width:90px;"><strong>Response</strong></td>
						</tr>
						@foreach(\Helper::casQuestions() as $q)
							@if(isset($casAnswers[$q['id']]))
								<tr>
									<td>{{ $q['question'] }}</td>
									<td style="text-align: center; white-space: nowrap;"><strong>{{ $q['options'][$casAnswers[$q['id']]] ?? '' }}</strong></td>
								</tr>
							@endif
						@endforeach
					</table>
				
					<br>
				</td>
				@php 
					$leftEyeRemarks = '';
					if (!empty($exam['exam_data']['leftEye'])) {
						$tedData = \Helper::tedDiseaseById($exam['exam_data']['leftEye']);
						if(($tedData['status'] ?? null) === 200){
							$leftEyeRemarks = $tedData['tedDisease']['name'];
						}
					}
					
					$rightEyeRemarks = '';
					if (!empty($exam['exam_data']['rightEye'])) {
						$tedData = \Helper::tedDiseaseById($exam['exam_data']['rightEye']);
						if(($tedData['status'] ?? null) === 200){
							$rightEyeRemarks = $tedData['tedDisease']['name'];
						}
					}
				@endphp
				<td rowspan="3" style="text-align: left; padding: 10px; vertical-align: top;" data-cell-padding="10"><strong data-pasted="true"><span style="font-size: 12px;">Diagnosis Details</span></strong>
					<br>
					<br>

					<table style="width: 100%; margin: auto;border-color: rgb(0, 0, 0); height: 99px;">
						<colgroup>
							<col style="width: 100.0000%;">
						</colgroup>
						<tbody>
							<tr style="height: 50px;">
								<td class="padding" data-cell-padding="10" style="padding: 10px;"><span style="font-size: 12px;" data-pasted="true"><strong>Left Eye:-</strong><br>{{ $leftEyeRemarks ?: '-' }}</span>
									<br>
								</td>
							</tr>
							<tr>
								<td data-cell-padding="10" style="padding: 10px;"><span style="font-size: 12px;" data-pasted="true"><strong>Right Eye:-</strong><br>{{ $rightEyeRemarks ?: '-' }}</span>
									<br>
								</td>
							</tr>
						</tbody>
					</table>
					<br><span style="font-size: 12px;"><br><br></span>
					<br>
				</td>
			</tr>
			<tr style="height: 83.6667px;">
				<td class="padding" data-cell-padding="10" style="padding: 10px;">

					<p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; margin-bottom: 4px;" data-pasted="true"><strong>Left Eye</strong></p>
					
					<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;">
						<tr style="height: 63px">
							@if(!empty($patient->l_eye_images) && !empty($patient->display_left_eye_images))
								@php $leftEyesArr = $patient->display_left_eye_images; @endphp
								@if(count($leftEyesArr) == 1)<td style="border:0;"></td>@endif
								@foreach($leftEyesArr as $key => $file)
									<td class="padding " data-cell-padding="10" style="padding: 10px;">
										<img src="{{ $file['src'] }}" width="100" height="100" style="border:1px solid #cccccc; padding:2px;">
										<div><small>Image {{ $key + 1 }}</small></div>
									</td>
								@endforeach
								@if(count($leftEyesArr) == 1)<td style="border:0;"></td>@endif
							@endif
						</tr>
					</table>
					<br>
				</td>
			</tr>
			<tr style="height: 67.6667px;">
				<td data-cell-padding="10" style="padding: 10px;">

					<p style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; margin-bottom: 4px;" data-pasted="true"><strong>Both Eyes</strong></p>
					
					<table width="100%" cellpadding="5" cellspacing="0" style="border:0px solid #eee;">
						<tr style="height: 63px">
							@if(!empty($patient->b_eye_images) && !empty($patient->display_both_eye_images))
								@php $bothEyesArr = $patient->display_both_eye_images; @endphp
								@if(count($bothEyesArr) == 1)<td style="border:0;"></td>@endif
								@foreach($bothEyesArr as $key => $file)
									<td class="padding " data-cell-padding="10" style="padding: 10px;">
										<img src="{{ $file['src'] }}" width="100" height="100" style="border:1px solid #cccccc; padding:2px;">
										<div><small>Image {{ $key + 1 }}</small></div>
									</td>
								@endforeach
								@if(count($bothEyesArr) == 1)<td style="border:0;"></td>@endif
							@endif
						</tr>
					</table>
					<br>
				</td>
			</tr>
		</tbody>
	</table>
 
	<hr>

	{{-- Notes --}}
	<p style="font-size:12px;">
		<strong>Diagnosis Notes:</strong> {{ $exam['remark'] ?? '-' }}
	</p>

	<p style="font-size:12px;">
		<strong>Follow Up:</strong>
		@if(\Helper::getFollowUpStatusById($patient->follow_up)['status'] == 200)
			<span class="badge badge-{{\Helper::getFollowUpStatusById($patient['follow_up'])['fStatus']['class']}}">
			{{ \Helper::getFollowUpStatusById($patient->follow_up)['fStatus']['name'] }}
			</span>
		@else
			-
		@endif
	</p>

	{{-- Doctor Info --}}
	<p style="font-size:12px;">
		<strong>Orvos Doctor:</strong>
		{{ $patient->remarkBy->first_name ?? '' }} {{ $patient->remarkBy->last_name ?? '' }}<br>

		<strong>NPI Number:</strong>
		{{ $patient->remarkBy->npi_number ?? '-' }}<br><br>

		@php
		$sigImg = '<span></span>';
		if(!empty($patient->remarkBy->signature)){
			$sigImg = '<img src="' . ($patient['remarkBy']['display_signature']['src'] ?? '') . '" style="max-height:50px; width:100%;">';
		}
		@endphp

		{!! $sigImg !!}
		<br>
		<strong>Signature</strong>
	</p>

	{{-- Footer Logo --}}
	<p style="text-align:right;">
		<img src="{{ asset('assets/images/1757501387_OrvosTransparentLogo1.png') }}" style="width:230px;">
	</p>

	</body>

	</html>

@endif
