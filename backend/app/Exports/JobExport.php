<?php
 
namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class JobExport implements FromView
{
    protected $job;

    public function __construct($job)
    {
        $this->job = $job;
    }

    public function view(): View
    {
        return view('exports.job', [
            'data' => $this->job
        ]);
    }
}