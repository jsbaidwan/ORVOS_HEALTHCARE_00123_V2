<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use App\Models\Company;
use App\Models\UserDocument;
use App\Notifications\ResetPassword as ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

	protected $appends = ['formated_created_at','google_map_api_key','display_signature','display_documents','display_avatar','is_active_status'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
   protected $fillable = [
        'code',
        'first_name',
        'last_name',
        'email',
        'user_name',
        'phone_number',
        'dob',
        'gender',
        'address',
        'city',
        'state_id',
        'zip',
        'latitude',
        'longitude',
        'bio',
        'image',
        'role_id',
        'npi_number',
		'caqh_id',
		'provider_id',
		'signature',
		'documents',
        'expiry_date',
        'licence_number',
        'password',
        'status',
		'ted_review_access',
        'expiry_reminder',
		'is_archived'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
		'company_ids' => 'array',  
    ];
	
	public static $rules = array(
  
		'first_name'  => 'required',
        'last_name'  => 'required',
        'role_id' => 'required',
        //'user_name' => 'required|unique:users',
		'email' => 'required|email|unique:users',
        'address' => 'required',
		//'city' => 'required',
		//'state_id' => 'required',
		//'zip' => 'required',
		'password' => 'required|min:8|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/',
		'confirm_password'  => 'required|min:8|same:password',		
		'phone_number' => 'nullable|regex:/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/',
    );
	
	public static $messages = [
         
    ];
	
	public function hasRole($role)
    { 
		if ($this->role()->where('slug', $role)->first()) {
            return true; 
        }
       
        return false;
    }
	
	public function sendPasswordResetNotification($token)
	{
		$this->notify(new ResetPasswordNotification($token));
	}
	
	public function role() 
    {
        return $this->belongsTo(Role::class);
    }
	
	public function roles() 
    {
        return $this->hasOne('App\Models\Role','id','role_id');
    }
	
	public function clinicUsers() 
    {
        return $this->hasMany('App\Models\ClinicUser','user_id','id');
    }

    public function licenses()
    {
        return $this->hasMany('App\Models\UserLicense','user_id','id');
    }
	  
	public function getGoogleMapApiKeyAttribute()
	{ 
		$apiKey = \Helper::googleMapApiKey()['google_map_api_key'];
		
		return  \Helper::encodeData($apiKey)['encoded'];
		 
	}
	
	public function setTimezoneAttribute($value)
    {
		$this->attributes['timezone'] = \Config('app.custom_timezone');
    }
	
	public function setCountryCodeAttribute($value)
    {
		$this->attributes['country_code'] = \Config('app.country_code'); 
    }
	
	public function getIsActiveStatusAttribute()
	{
		return \Helper::getIsActiveStatusById($this->status)['status'] ?? [];
		 
	}
	
	public function getDisplaySignatureAttribute()
	{
		$signature = $this->attributes['signature'] ?? null;
		$path = 'uploads/users/' . $this->user_name . '/signature/'.$signature;
		$exists = !empty($signature) && \Storage::disk('public')->exists($path);
		$status = $exists ? 200 : 422;
		
		if ($status === 200) {
			 
			$token = \Helper::fileTokenGen($path,$signature,\Helper::hasSigned());
			$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
			$src = $signedUrl;
			 
		} else {
			$src = asset('assets/images/dummy.png');
		}

		return [
			'status' => $status,
			'src' => $src,
			'name' => $signature
		];
	}
	
	public function getDisplayDocumentsAttribute()
	{
		$value = $this->attributes['documents'] ?? [];
		$arrFiles = !empty($value) ? json_decode($value, true) : [];
		$files = [];

		if (!empty($arrFiles)) {

			$files = collect($arrFiles)->map(function ($file) {

				$path = 'uploads/users/' . $this->user_name . '/documents/'.$file;
				$exists = !empty($file) && \Storage::disk('public')->exists($path);
				$status = $exists ? 200 : 422;
				 
				$token = \Helper::fileTokenGen($path,$file,\Helper::hasSigned());
				$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
				$src = $signedUrl;
				
				return [
					'status' => $status,
					'src' => $status == 200 ? $src : asset('assets/images/dummy.png'),
					'name' => $file
				];
			})->values()->toArray(); // reset index (important)
		}

		return $files;
	}
	
	public function getDisplayAvatarAttribute()
	{
		$image = $this->attributes['image'] ?? null;
		$path = 'uploads/users/' . $this->user_name . '/'.$image;
		$exists = !empty($image) && \Storage::disk('public')->exists($path);
		$status = $exists ? 200 : 422;
		
		if ($status === 200) {
			 
			$token = \Helper::fileTokenGen($path,$image,\Helper::hasSigned());
			$signedUrl = \Helper::fileSignedRoute($token,\Helper::hasSigned());
			$src = $signedUrl;
			 
		} else {
			$src = asset('assets/images/dummy.png');
		}

		return [
			'status' => $status,
			'src' => $src,
			'name' => $image
		];
	}
	  
	public function getFormatedCreatedAtAttribute()
	{
		if (!empty($this->created_at)) {
			return \Carbon\Carbon::parse($this->created_at)->format('D, M d Y');
		}

		return null; // or return 'N/A';
	}
	
}
