<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    // Permitir inserción masiva (para los Seeders)
    protected $fillable = ['name'];

    /**
     * Una provincia puede tener muchos anuncios publicados en ella.
     */
    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
}