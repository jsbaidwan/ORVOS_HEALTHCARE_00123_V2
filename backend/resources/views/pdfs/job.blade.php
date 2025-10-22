<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job #{{ $data['job_number'] }}</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
        }

        .container {
            padding: 30px;
        }

        .header, .section {
            margin-bottom: 20px;
        }

        .company-info {
            text-align: right;
            font-size: 10px;
        }

        .company-info p {
            margin: 2px 0;
        }

        .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .flex-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .info-table {
			border: 1px solid #ccc;
            width: 100%;
            margin-top: 10px;
        }
		.info-table, .info-table th, .info-table td {
            border: 1px solid #ccc;
            border-collapse: collapse;
        }
		
		.info-table th, .info-table td {
            padding: 8px;
            text-align: left;
        }
  
        .service-address, .customer-info {
            width: 50%;
            display: inline-block;
            vertical-align: top;
        }

        .line {
            border-top: 1px solid #000;
            margin: 20px 0;
        }

        .job-table, .job-table th, .job-table td {
            border: 1px solid #ccc;
            border-collapse: collapse;
        }

        .job-table {
            width: 100%;
            margin-top: 10px;
        }

        .job-table th, .job-table td {
            padding: 8px;
            text-align: left;
        }

        .footer-note {
            margin-top: 40px;
            font-size: 10px;
        }

        .signature {
			 
			margin-top: 55px;
		}

		  
        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="flex-header title">
				<table>
					<tr>
						<th class="title"> Job</th>
						<td style="width: 60%;">
							&nbsp;	 
						</td>
						
						<td><img src="{{ $data['company']['logo']['public_path'] }}" width="200" /></td>
					 
					</tr>
				</table>

            </div>

            <table class="info-table">
                <tr>
                    <td>
                        <strong>Job #:</strong> {{ $data['job_number'] ?? '' }}<br>
                        <strong>Date:</strong> {{ $data['requested_on'] ?? '' }}<br>
                        <strong>PO#:</strong> {{ $data['po_number'] ?? '' }}
                    </td>
                    <td class="company-info">
						<strong>{{ $data['company']['name'] }}</strong><br>
                        {{ $data['company']['address1'] }}<br>
                        {{ $data['company']['city'] }}, {{ $data['company']['state'] }}<br>
                        {{ $data['company']['primary_number'] }} / {{ $data['company']['zipcode'] }}<br>
                        {{ $data['company']['primary_email'] }}
                    </td>
                </tr>
            </table>
        </div>
		
		 <table class="info-table">
			<tr>
				<th>Customer</th>
				<th>Service Loction</th>
			</tr>
			<tr>
				<td>
					 
					{{ $data['customer']['p_first_name'] ?? '' }} {{ $data['customer']['p_last_name'] ?? '' }}<br>
					
					@foreach($data['customer']['p_phone_numbers'] as $phone)
						{{ $phone['number'] ?? '' }} <br><br>
					@endforeach
					
					
				</td>
				<td>
					  
					@foreach($data['customer']['service_locations'] as $location)
						{{ $location['street_address'] ?? '' }}<br>
						{{ $location['city'] ?? '' }},{{ $data['customer']['service_locations'][0]['state'] ?? '' }}<br>
						{{ $location['zipcode'] ?? '' }}
						<br><br>
						 
					@endforeach
					 
					 
				</td>
			</tr>
		</table>
		 
		
        <table class="info-table">
			<tr>
				<th>Description</th>
				 
			</tr>
			<tr>
				<td>
					<p>{{ $data['description'] ?? '' }}</p>
				</td>
			</tr>
        </table>
		
		 
        <table class="job-table">
            <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
            </tr>
            @foreach ($data['products'] ?? [] as $item)
                <tr>
                    <td>{{ $item['description'] }}</td>
                    <td>{{ $item['quantity'] }}</td>
                    <td>{{ $item['rate'] }}</td>
                    <td>{{ !empty($item['total']) ? \Helper::formatCurrency($item['total']) : '$0' }}</td>
                </tr>
            @endforeach
            <tr>
                <td colspan="3" class="text-right"><strong>Job Total:</strong></td>
                <td><strong>{{ !empty($data['total_products_services_tax_fee']) ? \Helper::formatCurrency($data['total_products_services_tax_fee']) : '$0' }}</strong></td>
            </tr>
			
        </table>
		
		@if(!empty($data['total_driver_labor_time_cost']) && $data['total_driver_labor_time_cost'] > 0)
		<table class="info-table">
		
			<tr>
				<th>Drive Time</th>
				<th>Labor Time</th>
				<th>Driver Rate</th>
				<th>Labor Rate</th>
				<th>Driver Total</th>
				<th>Labor Total</th>
				<th>Billable</th>
				<th>Total</th>
			</tr>
			  
			@foreach ($data['driver_labor_times'] ?? [] as $value)
			<tr>
				<td>
					{{ $value['driveStartTime'] }} - {{ $value['driveEndTime'] }}
					({{ $value['driverHours'] }}h {{ $value['driverMinutes'] }}m)
				</td>
				<td>
					{{ $value['laborStartTime'] }} - {{ $value['laborEndTime'] }}
					({{ $value['laborHours'] }}h {{ $value['laborMinutes'] }}m)
				</td>
				<td>{{ $value['driverRate'] }}</td>
				<td>{{ $value['laborRate'] }}</td>
				<td>{{ !empty($value['driverTotal']) ? \Helper::formatCurrency($value['driverTotal']) : '$0' }}</td>
				<td>{{ !empty($value['laborTotal']) ? \Helper::formatCurrency($value['laborTotal']) : '$0' }}</td>
				<td>
					Driver: {{ $value['driverBillable'] ? 'Yes' : 'No' }} |
					Labor: {{ $value['laborBillable'] ? 'Yes' : 'No' }}
				</td>
				<td>{{ !empty($value['total']) ? \Helper::formatCurrency($value['total']) : '$0' }}</td>
			</tr>
			@endforeach
			  
        </table>
		@endif
		
		@if(!empty($data['total_billable_expenses_cost']) && $data['total_billable_expenses_cost'] > 0)
		<table class="info-table">
		
			<tr>
				<th>Date</th>
				<th>Category</th>
				<th>Billable</th>
				<th>Reimburse To</th>
				<th>Total</th>
			</tr>
			  
			@foreach ($data['expenses'] ?? [] as $value)
			<tr>
				<td>{{ $value['date'] }}</td>
				<td>{{ $value['category']['name'] }}</td>
				<td>{{ $value['billable'] ? 'Yes' : 'No' }}</td>
				<td>{{ $value['reimburse_to_user']['first_name'] }} {{ $value['reimburse_to_user']['last_name'] }}</td>
				<td>{{ !empty($value['amount']) ? \Helper::formatCurrency($value['amount']) : '$0' }}</td>
			</tr>
			@endforeach
			  
        </table>
		@endif
		
		
		<table class="job-table">
		
			<tr>
                <th colspan="3" class="text-right"><strong>Time and Labor:</strong></th>
               
            
                <th colspan="3" class="text-right"><strong>Expenses:</strong></th>
				
				
				<th colspan="3" class="text-right"><strong>Total:</strong></th>
                
            
                <th colspan="3" class="text-right"><strong>PMTS/DEPS:</strong></th>
                
             
                <th colspan="3" class="text-right"><strong>Total Due:</strong></th>
               
            </tr>
			 
			<tr>
                
                <td colspan="3"><strong>{{ !empty($data['total_driver_labor_time_cost']) ? \Helper::formatCurrency($data['total_driver_labor_time_cost']) : '$0' }}</strong></td>
            
                
                <td colspan="3"><strong>{{ !empty($data['total_billable_expenses_cost']) ? \Helper::formatCurrency($data['total_billable_expenses_cost']) : '$0' }}</strong></td>
				
				<td colspan="3"><strong>{{ !empty($data['job_total']) ? \Helper::formatCurrency($data['job_total']) : '$0' }}</strong></td>
            
                
                <td colspan="3"><strong>{{ !empty($data['total_payments_deposits_cost']) ? \Helper::formatCurrency($data['total_payments_deposits_cost']) : '$0' }}</strong></td>
             
				<td colspan="3"><strong>{{ !empty($data['total_due']) ? \Helper::formatCurrency($data['total_due']) : '$0' }}</strong></td>
            </tr>
		</table>

        <table class="info-table">
			<tr>
				<th>Customer Note</th>
				 
			</tr>
            <tr>
				<td>
					<p>{{ $data['note_to_customer'] ? $data['note_to_customer'] : 'No note found' }}</p>
				</td>
			</tr>
       </table>

        <div class="signature">
		<table>
			<tr>
				<td>
						
					<p><strong>Prework Signature</strong></p>
					<p>Signed By: ____________________________</p>
				</td>
				<td style="width: 40%;">
					&nbsp;	 
				</td>
				<td>
					<p><strong>Postwork Signature</strong></p>
					<p>Signed By: ____________________________</p>
				</td>
			</tr>
			 
		</table>
		</div>
    </div>
</body>
</html>
