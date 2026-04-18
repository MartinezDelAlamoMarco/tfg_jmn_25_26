<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tonality extends Model
{
    protected $fillable = ['name'];

    /**
     * Una tonalidad (ej: Rojo, Negro Perla) la tienen muchos vehículos.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}