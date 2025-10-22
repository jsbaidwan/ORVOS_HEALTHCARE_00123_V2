<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Estimate #{{ $data['estimation_number'] }}</title>
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

        .estimate-table, .estimate-table th, .estimate-table td {
            border: 1px solid #ccc;
            border-collapse: collapse;
        }

        .estimate-table {
            width: 100%;
            margin-top: 10px;
        }

        .estimate-table th, .estimate-table td {
            padding: 8px;
            text-align: left;
        }

        .footer-note {
            margin-top: 40px;
            font-size: 10px;
        }

        .signature {
            margin-top: 60px;
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
						<th class="title"> Estimate</th>
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
                        <strong>Estimate #:</strong> {{ $data['estimation_number'] ?? '' }}<br>
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

        <table class="estimate-table">
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
                <td colspan="3" class="text-right"><strong>Estimate Total:</strong></td>
                <td><strong>{{ !empty($data['total_products_services_tax_fee']) ? \Helper::formatCurrency($data['total_products_services_tax_fee']) : '$0' }}</strong></td>
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
            <p><strong>Accepted Online</strong></p>
            <p>Signed By: ____________________________</p>
        </div>
    </div>
</body>
</html>
