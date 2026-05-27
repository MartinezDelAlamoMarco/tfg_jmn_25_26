<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdvertisementView extends Model
{
    protected $table = 'view_advertisements_details';
    
    
    public $incrementing = false;
    public $timestamps = false;

  
    protected $casts = [
        'images' => 'array'
    ];
}