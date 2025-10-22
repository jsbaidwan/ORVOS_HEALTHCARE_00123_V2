 
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
	
    {{-- Company & Estimate Info --}}
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
			Estimate #: {{ $data['estimation_number'] ?? '' }}
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
        <th colspan="6" style="background-color:#f2f2f2;">Customer</th>
        <th colspan="3" style="background-color:#f2f2f2;">Service Location</th>
        
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
        <th colspan="3" style="background-color:#d9d9d9;">Item</th>
        <th colspan="2" style="background-color:#d9d9d9;">Qty</th>
        <th colspan="2" style="background-color:#d9d9d9;">Rate</th>
        <th colspan="2" style="background-color:#d9d9d9;">Total</th>
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

    {{-- Estimate Total --}}
    <tr>
        <td colspan="3" style="font-weight:bold;">Estimate Total</td>
		<td colspan="4"></td>
        <td colspan="2" style="font-weight:bold;">
            {{ !empty($data['total_products_services_tax_fee']) ? \Helper::formatCurrency($data['total_products_services_tax_fee']) : '$0.00' }}
        </td>
        <td colspan="2"></td>
    </tr>
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

    {{-- Final spacing --}}
    <tr><td colspan="6" style="height:20px;"></td></tr>
</table>
