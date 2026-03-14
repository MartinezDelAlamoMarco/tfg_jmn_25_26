<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    //
    public function favourites(){
        return $this->hasMany(Favourite::class);
    }
    public function transactions(){
        return $this->hasMany(Transaction::class);
    }
    public function advertisementImages(){
        return $this->hasMany(AdvertisementImage::class);
    }
    public function users(){
        return $this->belongsToMany(User::class);
    }
    public function rents(){
        return $this->belongsTo(Rent::class);
    }
    public function models(){
        return $this->belongsTo(VehicleModel::class);
    }
}
