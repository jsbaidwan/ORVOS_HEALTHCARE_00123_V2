@component('mail::message')
<p style="
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    color: #3d4852;
    font-size: 18px;
    font-weight: bold;
    margin-top: 0;
    text-align: left;
">
    Dear Dr. {{ $doctor['first_name'] ?? '' }} {{ $doctor['last_name'] ?? '' }},
</p>

@if(count($licenses) > 1)
	
	The following license{{ count($licenses) > 1 ? '(s)' : '' }} include one that expires in the next {{ $doctor['license_expiring_days'] ?? '' }} days. Please apply for renewal and update the relevant information with the {{ config('app.name') }} administration team.
  
@else
	The license{{ count($licenses) > 1 ? '(s)' : '' }} below is set to expire in the next {{ $doctor['license_expiring_days'] ?? '' }} days. Please apply for a renewal and update the information with {{ config('app.name') }} administration team.
	
@endif

<table border="2" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%; text-align: center;">
@foreach($licenses as $license)
<tr style="background-color: #f2f2f2;">
	<th>License Number</th>
	<th>State</th>
	<th>Expiry Date</th>
</tr>
<tr>
	<td>{{ $license['licence_number'] }}</td>
	<td>{{ $license['getState']['name'] }}</td>
	<td>{{ $license['expiry_date'] }}</td>
</tr>
  
@endforeach
</table>

<br>
<br>

<p style="font-size:16px;">
    Regards,<br>
    {{ config('app.name') }}
</p>
@endcomponent