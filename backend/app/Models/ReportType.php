<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportType extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // Un tipo de reporte puede estar en muchos reportes
    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
