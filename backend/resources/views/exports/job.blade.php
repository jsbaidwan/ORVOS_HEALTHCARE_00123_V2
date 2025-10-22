 
<table style="width:100%; border-collapse:collapse;">

	<tr>
		<td colspan="4" style="background-color:#f2f2f2;"></td>
		<td style="text-align: center">
			<img src="{{ $data['company']['logo']['public_path'] }}" width="300"/>
		</td>
		<td colspan="4" style="background-color:#f2f2f2;"></td>
    </tr>
	
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	
    {{-- Company & Job Info --}}
    <tr>
        <td colspan="5" rowspan="8" style="text-align: left; vertical-align: top;">
            <strong>{{ $data['company']['name'] }}</strong><br>
			{{ $data['company']['address1'] }}<br>
			{{ $data['company']['city'] }}, {{ $data['company']['state'] }}<br>
			{{ $data['company']['primary_number'] }} / {{ $data['company']['zipcode'] }}<br>
			{{ $data['company']['primary_email'] }}
        </td>
		 
		<td colspan="4" rowspan="8" style="text-align: left; vertical-align: top;">
			<strong>
			Job #: {{ $data['job_number'] ?? '' }}
			</strong><br>
			<strong>Date:</strong> {{ $data['requested_on'] ?? '' }}<br>
			<strong>PO#:</strong> {{ $data['po_number'] ?? '' }}<br>
			 
        </td>
    </tr>
	   
    <tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	 
    {{-- Customer & Service Info --}}
    <tr>
        <th colspan="6" style="background-color:#f2f2f2;"><strong>Customer</strong></th>
        <th colspan="3" style="background-color:#f2f2f2;"><strong>Service Location</strong></th>
        
    </tr>
    <tr>
        <td colspan="6" rowspan="6" style="text-align: left; vertical-align: top;">{{ $data['customer']['name'] ?? '' }}</td>
        <td colspan="3" rowspan="6" style="text-align: left; vertical-align: top;">
            @foreach($data['customer']['service_locations'] ?? [] as $location)
                {{ $location['street_address'] ?? '' }}
                {{ $location['city'] ?? '' }}, {{ $location['state'] ?? '' }}
                {{ $location['zipcode'] ?? '' }}<br>
            @endforeach
        </td>
        
    </tr>
	 

    <tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>

    {{-- Item Headers --}}
    <tr>
        <th colspan="3" style="background-color:#d9d9d9;"><strong>Item</strong></th>
        <th colspan="2" style="background-color:#d9d9d9;"><strong>Qty</strong></th>
        <th colspan="2" style="background-color:#d9d9d9;"><strong>Rate</strong></th>
        <th colspan="2" style="background-color:#d9d9d9;"><strong>Total</strong></th>
        <td colspan="2"></td>
    </tr>

    {{-- Line Items --}}
    @foreach ($data['products'] ?? [] as $item)
        <tr>
            <td colspan="3">{{ $item['description'] }}</td>
            <td colspan="2">{{ $item['quantity'] }}</td>
            <td colspan="2">{{ $item['rate'] }}</td>
            <td colspan="2">{{ !empty($item['total']) ? \Helper::formatCurrency($item['total']) : '$0.00' }}</td>
            <td colspan="2"></td>
        </tr>
    @endforeach

    {{-- Job Total --}}
    <tr>
        <td colspan="3" style="font-weight:bold;">Job Total</td>
		<td colspan="4"></td>
        <td colspan="2" style="font-weight:bold;">
            {{ !empty($data['total_products_services_tax_fee']) ? \Helper::formatCurrency($data['total_products_services_tax_fee']) : '$0.00' }}
        </td>
        <td colspan="2"></td>
    </tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	
	@if(!empty($data['total_driver_labor_time_cost']) && $data['total_driver_labor_time_cost'] > 0)
		
		<tr>
			<th colspan="2" style="background-color:#d9d9d9;"><strong>Drive Time</strong></th>
			<th colspan="1" style="background-color:#d9d9d9;"><strong>Labor Time</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Driver Rate</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Labor Rate</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Driver Total</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Labor Total</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Billable</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Total</strong></th>
		</tr>
			
		@foreach ($data['driver_labor_times'] ?? [] as $value)
			<tr>
				<td colspan="2">
					{{ $value['driveStartTime'] }} - {{ $value['driveEndTime'] }}
					({{ $value['driverHours'] }}h {{ $value['driverMinutes'] }}m)
				</td>
				<td colspan="1">
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
	@endif
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	
	@if(!empty($data['total_billable_expenses_cost']) && $data['total_billable_expenses_cost'] > 0)
		<tr>
			<th colspan="3" style="background-color:#d9d9d9;"><strong>Date</strong></th>
			<th colspan="3" style="background-color:#d9d9d9;"><strong>Category</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Billable</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Reimburse To</strong></th>
			<th style="background-color:#d9d9d9;"><strong>Total</strong></th>
		</tr>
		@foreach ($data['expenses'] ?? [] as $value)
			<tr>
				<td colspan="3">{{ $value['date'] }}</td>
				<td colspan="3">{{ $value['category']['name'] }}</td>
				<td>{{ $value['billable'] ? 'Yes' : 'No' }}</td>
				<td>{{ $value['reimburse_to_user']['first_name'] }} {{ $value['reimburse_to_user']['last_name'] }}</td>
				<td>{{ !empty($value['amount']) ? \Helper::formatCurrency($value['amount']) : '$0' }}</td>
			</tr>
		@endforeach  
	@endif
	
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	
    {{-- Notes --}}
    @if (!empty($data['note_to_customer']))
        <tr>
            <td colspan="3" style="white-space:pre-wrap;">
                <strong>Customer Note:</strong> 
            </td>
			<td colspan="6" style="text-align: left; vertical-align: top;">{{ $data['note_to_customer'] }} </td>
        </tr>
    @endif
	
	@if (!empty($data['description']))
        <tr>
            <td colspan="3" style="white-space:pre-wrap;">
                <strong>Job Description:</strong> 
            </td>
			<td colspan="6" style="text-align: left; vertical-align: top;">{{ $data['description'] }} </td>
        </tr>
    @endif

	@if (!empty($data['note_for_tech']))
        <tr>
            <td colspan="3" style="white-space:pre-wrap;" >
                <strong>Note For Tech:</strong> 
            </td>
			<td colspan="6" style="text-align: left; vertical-align: top;">{{ $data['note_for_tech'] }} </td>
        </tr>
    @endif
	
	<tr><td colspan="6" style="height:15px;"></td></tr>
	<tr><td colspan="6" style="height:15px;"></td></tr>
	
	<tr>
		<th colspan="2" style="background-color:#d9d9d9;"><strong>Time and Labor:</strong></th>
	   
	
		<th colspan="3" style="background-color:#d9d9d9;"><strong>Expenses:</strong></th>
		
	
		<th colspan="2" style="background-color:#d9d9d9;"><strong>PMTS/DEPS:</strong></th>
		
	 
		<th colspan="2" style="background-color:#d9d9d9;"><strong>Total Due:</strong></th>
	   
	</tr>

	<tr>
                
		<td colspan="2"><strong>{{ !empty($data['total_driver_labor_time_cost']) ? \Helper::formatCurrency($data['total_driver_labor_time_cost']) : '$0' }}</strong></td>
	
		
		<td colspan="3"><strong>{{ !empty($data['total_billable_expenses_cost']) ? \Helper::formatCurrency($data['total_billable_expenses_cost']) : '$0' }}</strong></td>
	
		
		<td colspan="2"><strong>{{ !empty($data['total_products_services_tax_fee']) ? \Helper::formatCurrency($data['total_products_services_tax_fee']) : '$0' }}</strong></td>
	 
		<td colspan="2"><strong>{{ !empty($data['total_due']) ? \Helper::formatCurrency($data['total_due']) : '$0' }}</strong></td>
	</tr>
			
    {{-- Final spacing --}}
    <tr><td colspan="6" style="height:20px;"></td></tr>
</table>
