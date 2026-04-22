
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
@else

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
	@endphp

	{{-- Header Logo --}}
	@if ($clinicImage['status'] == 200)
		<div style="text-align:center;">
	 
			<img src="{{ $clinicImage['path'] }}" style="width:150px;">
		</div>
	@else
		<h1 class="text-center"><u>{{$patient->clinic->name}}</u></h1>
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
		{{ $patient->dob }}<br>

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
									<small>L ({{$key + 1}}) </small>
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
									<small>R ({{$key + 1}}) </small>
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
				@php $exam =  $patient->remark_result @endphp
				@if(!empty($exam['exam_data']['leftEye']))
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
				@if(!empty($exam['exam_data']['rightEye']))
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
		<img src="{{ asset('assets/images/1757501387_OrvosTransparentLogo1.png') }}" style="width:224px;">
	</p>
	 

	</body>

</html>
@endif
