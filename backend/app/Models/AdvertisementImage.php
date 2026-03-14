<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvertisementImage extends Model
{
    //
    public function advertisement(){
        return $this->belongsTo(Advertisement::class);
    }
}
