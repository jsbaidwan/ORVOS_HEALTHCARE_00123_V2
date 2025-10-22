<?php
 
namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class EstimationExport implements FromView
{
    protected $estimation;

    public function __construct($estimation)
    {
        $this->estimation = $estimation;
    }

    public function view(): View
    {
        return view('exports.estimation', [
            'data' => $this->estimation
        ]);
    }
}