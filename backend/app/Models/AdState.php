<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdState extends Model
{
    protected $fillable = ['name'];

    /**
     * Un estado (ej: Disponible, Reservado, Vendido) se aplica a muchos anuncios.
     */
    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
}