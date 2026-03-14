<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rent extends Model
{
    //
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function advertisement(){
        return $this->hasMany(Advertisement::class);
    }
}
