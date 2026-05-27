<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportPriority extends Model
{

    protected $table = 'view_reports_priority';
    

    public $incrementing = false;
    public $timestamps = false;

    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class, 'advertisement_id');
    }
}