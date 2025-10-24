@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">

<img src="{{ asset('assets/images/OrvosTransparentLogo1.png') }}" class="logo" alt="{{ config('app.name') }}" style="width:160px !important;">

<!--
@if (trim($slot) === 'Laravel')
<img src="https://laravel.com/img/notification-logo.png" class="logo" alt="Laravel Logo">
@else
{{ $slot }}
@endif
-->

</a>
</td>
</tr>
