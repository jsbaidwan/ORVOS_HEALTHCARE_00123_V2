<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    protected $fillable = [
        'name',
        'country_id'
    ];

    protected $table = 'states';

    protected $appends = ['u_id'];

    /*
    |--------------------------------------------------------------------------
    | Get Encrypted UID
    |--------------------------------------------------------------------------
    */

    public function getUIdAttribute()
    {
        if (!\Helper::hasEncrypt()) {
            return $this->attributes['id'];
        }

        return \Helper::encryptData($this->attributes['id'])['encrypt'];
    }

    /*
    |--------------------------------------------------------------------------
    | Set / Decrypt UID
    |--------------------------------------------------------------------------
    */

    public function setUIdAttribute($value)
    {
        if (!\Helper::hasEncrypt()) {
            $this->attributes['id'] = $value;
            return;
        }

        $this->attributes['id'] = \Helper::decryptData($value)['decrypt'];
    }
}