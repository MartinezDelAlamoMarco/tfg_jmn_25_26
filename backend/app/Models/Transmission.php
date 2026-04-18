<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transmission extends Model
{
    protected $fillable = ['name'];

    /**
     * Un tipo de transmisión (Manual, Automática) la tienen muchos vehículos.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}