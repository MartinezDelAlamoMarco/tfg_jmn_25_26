<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rent extends Model
{
    use HasFactory;

    protected $fillable = [
        'advertisement_id',
        'renter_id',
        'start_date',
        'end_date',
        'total_price'
    ];

    // Relación: Una reserva pertenece a un anuncio
    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }

    // Relación: Una reserva pertenece a un usuario (el que alquila)
    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }
}
