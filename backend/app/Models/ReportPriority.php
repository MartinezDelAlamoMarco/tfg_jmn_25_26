<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportPriority extends Model
{
    // Le decimos que use la vista en lugar de una tabla
    protected $table = 'view_reports_priority';
    
    // Las vistas no tienen IDs únicos incrementales, así que desactivamos esto
    public $incrementing = false;
    public $timestamps = false;

    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class, 'advertisement_id');
    }
}