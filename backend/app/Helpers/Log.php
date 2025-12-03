<?php

namespace App\Helpers;

use Auth;
use Illuminate\Http\Request;
use App\Models\Log as LogModel;;

class Log{
	 
	/*
	 *---------------------------------
	 * Start: Save a log entry
	 * --------------------------------
	 */
	 
    public static function save($text, $description  = null,$module = null, $moduleId = null)
    {
        return LogModel::create([
            'user_id'   => Auth::id(),
            'module'    => $module,
            'module_id' => $moduleId,
            'url'       => request()->fullUrl(),
            'text'      => $text,
			'description' => $description,
            'method'    => request()->method(),
            'ip'        => request()->ip(),
            'agent'     => request()->header('User-Agent'),
        ]);
    }

    /*
	 *---------------------------------
	 * End: Save a log entry
	 * --------------------------------
	 */
    
}

	