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

    public function advertisement()
    {
        return $this->belongsTo(Advertisement::class);
    }

    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }
}
