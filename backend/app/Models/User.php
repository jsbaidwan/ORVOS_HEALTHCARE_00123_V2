<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use App\Models\Company;
use App\Models\UserDocument;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

	protected $appends = ['formated_created_at','google_map_api_key'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
		'last_name',
		'username',
        'email',
		'role_id',
		'image',
		'timezone',
		'country_code',	
		'remember_token'
		 
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
	
	public static $rules = [
		'first_name' => ['required', 'string', 'max:255'],
		'last_name' => ['required', 'string', 'max:255'],
		'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
		'password' => ['required', 'string', 'min:8', 'confirmed'],
    ];
	
	public static $messages = [
         
    ];
	
	public function hasRole($role)
    { 
		if ($this->role()->where('slug', $role)->first()) {
            return true; 
        }
       
        return false;
    }
	
	public function role() 
    {
        return $this->belongsTo(Role::class);
    }
	
	public function roles() 
    {
        return $this->hasOne('App\Models\Role','id','role_id');
    }
	 
	
	public function getGoogleMapApiKeyAttribute()
	{ 
		$apiKey = \Helper::googleMapApiKey()['google_map_api_key'];
		
		return  \Helper::encodeData($apiKey)['encoded'];
		 
	}
	
	public function getFormatedCreatedAtAttribute()
	{
		if (!empty($this->created_at)) {
			return \Carbon\Carbon::parse($this->created_at)->format('D, M d Y');
		}

		return null; // or return 'N/A';
	}
	
}
