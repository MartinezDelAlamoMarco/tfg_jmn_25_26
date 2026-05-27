<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdState extends Model
{
    protected $fillable = ['name'];
    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }
}