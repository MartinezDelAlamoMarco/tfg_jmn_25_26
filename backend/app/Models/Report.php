<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id',
        'advertisement_id',
        'report_type_id',
        'description',
        'status'
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

   
    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }

    // Relación con el tipo de motivo
    public function type()
    {
        return $this->belongsTo(ReportType::class, 'report_type_id');
    }
}