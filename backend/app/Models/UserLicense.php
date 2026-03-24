<?php
namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;

class UserLicense extends Model
{
    use Notifiable;

    protected $table = 'user_licenses'; 
    protected $fillable = ['user_id', 'licence_number', 'l_state_id', 'expiry_date','insurance_carriers_ids'];


    public function getState()
    {
        return $this->belongsTo('App\Models\State', 'l_state_id', 'id');
    }
    
}