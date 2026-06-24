<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Validation\Rule;
  
class PdfTemplate extends Authenticatable
{
    use Notifiable;

	protected $table = 'pdf_templates'; 

	protected $appends = ['category'];	
	 
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name','user_id','clinic_id','pdf_template_category_id','status','body'
    ];
	
	public static function rules($id = null,$userId = null)
    {
        return [
			'name' => [
                'required',
                Rule::unique('pdf_templates')->ignore($id)->where(function ($query) use($userId) {
                    return $query->where('clinic_id', request('clinic_id'))->where('pdf_template_category_id', request('pdf_template_category_id'))->where('user_id', $userId);
                }),
            ],
            'clinic_id' => 'required', 
			'pdf_template_category_id' => [
                'required',
                Rule::unique('pdf_templates')->ignore($id)->where(function ($query) use($userId) {
					if(\Auth::user()->role_id == 1){
						return $query->where('clinic_id', request('clinic_id'))->where('pdf_template_category_id', request('pdf_template_category_id'));
					}else{
						return $query->where('clinic_id', request('clinic_id'))->where('pdf_template_category_id', request('pdf_template_category_id'))->where('user_id', $userId);
					}
                    
                }),
            ],
            
            'body' => 'required|string',
            //'status' => 'required',
             
        ];
    }
	
	public static function messages()
	{
		return [
			'name.unique' => 'This name is already assigned to the clinic. Please remove it from the active or archived list before assigning it again.',
			'pdf_template_category_id.unique' => 'This category is already assigned to the clinic. Please remove it from the active or archived list before assigning it again.',
		];
	}
 
    public function clinic() 
    {  
        return $this->hasOne('App\Models\Clinic','id','clinic_id');

    }

    public function user() 
    {  
        return $this->hasOne('App\Models\User','id','user_id');

    }
	
	public function getCategoryAttribute()
	{
		$value = $this->attributes['pdf_template_category_id'] ?? null;

		return \Helper::getPdfTempCategoryById($value)['pdfTempCategory'] ?? null;
	}
       
}
