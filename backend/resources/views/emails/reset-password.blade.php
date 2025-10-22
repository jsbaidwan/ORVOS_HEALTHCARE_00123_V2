<div style="background-color:#fff;padding:45px 0 34px 0;border-radius:24px;margin:40px auto;max-width:600px;border: 3px solid #26212112;">
	<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" height="auto" style="border-collapse:collapse">
		<tbody>                      
			<tr>
				<td align="center" valign="center" style="text-align:center; padding-bottom: 10px">
					
					<!--begin:Email content-->
					<div style="text-align:center; margin:0 15px 34px 15px">
						<!--begin:Logo-->
						<div style="margin-bottom: 10px">
							<a href="{{Url('/')}}" rel="noopener" style="text-decoration:none;" target="_blank">
								<!--<h1 class="logo-Text fw-normal" style="color: rgb(0, 0, 0);font-family: 'Sequel 100 Wide 95' !important;font-size: 27px !important;">{{config('app.name')}}</h1>-->
								<img alt="{{config('app.name')}}" src="{{asset('assets/images/hey-visuals-logo.png')}}" alt="logo" width="30%" class="w-100">  
								<!--<img alt="Logo" src="/metronic8/demo17/assets/media/email/logo-1.svg" style="height: 35px">-->                
							</a>
						</div>
						<!--end:Logo-->

						<!--begin:Media-->
						<div style="margin-bottom: 15px"> 
							<!--<img alt="Logo" src="{{Url('public/assets/images/icon-polygon.svg')}}">-->           
						</div> 
						<!--end:Media-->                            

						<!--begin:Text-->
						<div style="font-size: 14px; font-weight: 500; margin-bottom: 27px; font-family:Arial,Helvetica,sans-serif;">
							<p style="margin-bottom:9px; color:#181C32; font-size: 22px; font-weight:700">Hello, You are receiving this email because we received a password reset request for your account.</p>
							<p style="margin-bottom:2px; color:#7E8299">This password reset link will expire in {{$count}} minutes.</p>
							 
						</div>  
						<!--end:Text-->
						 
						<!--begin:Action-->
						<a href="{{$url}}" target="_blank" style="text-decoration:none;background-color:#50cd89; border-radius:6px;display:inline-block; padding:11px 19px; color: #FFFFFF; font-size: 14px; font-weight:500;">
							Reset Password
						</a>
						<!--begin:Action-->      
					</div>
					<!--end:Email content-->    
				</td>
			</tr>  
  
				 
			<tr>
				<td align="center" valign="center" style="font-size: 13px; text-align:center; padding: 0 10px 10px 10px; font-weight: 500; color: #A1A5B7; font-family:Arial,Helvetica,sans-serif">
					<p style="color:#181C32; font-size: 16px; font-weight: 600; margin-bottom:9px                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ">It’s all about customers!</p>
					 <p style="margin-bottom:2px">If you did not request a password reset, no further action is required.</p> 
					                         
				</td>
			</tr>   
			
			<!--<tr>
				<td align="center" valign="center" style="text-decoration:none;text-align:center; padding-bottom: 20px;">                                
					<a href="#" style="text-decoration:none;margin-right:10px"><img alt="Logo" src="/metronic8/demo17/assets/media/email/icon-linkedin.svg"></a>    
					<a href="#" style="text-decoration:none;margin-right:10px"><img alt="Logo" src="/metronic8/demo17/assets/media/email/icon-dribbble.svg"></a>    
					<a href="#" style="text-decoration:none;margin-right:10px"><img alt="Logo" src="/metronic8/demo17/assets/media/email/icon-facebook.svg"></a>   
					<a href="#"><img alt="Logo" src="/metronic8/demo17/assets/media/email/icon-twitter.svg"></a>                           
				</td>
			</tr>-->
			
			<tr>
				<td align="center" valign="center" style="font-size: 13px; padding:0 15px; text-align:center; font-weight: 500; color: #A1A5B7;font-family:Arial,Helvetica,sans-serif">                            
					<p> © {{date('Y')}} {{Config('app.name')}}. All rights reserved.
						<!--<a href="{{Url('/')}}" rel="noopener" target="_blank" style="color:#50cd89 !important;text-decoration:none;font-weight: 600;font-family:Arial,Helvetica,sans-serif">Unsubscribe</a>&nbsp;
						from newsletter.-->
					</p>                         
				</td>
			</tr>      
		</tbody>   
	</table> 
</div>