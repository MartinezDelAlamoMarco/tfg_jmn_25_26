<?php

namespace App\Models;

// Importaciones necesarias para la autenticación y tokens
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Advertisement;

class User extends Authenticatable
{
    // HasApiTokens permite generar los tokens para React
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = [
        'name',
        'email',
        'password',
        'telephone',
        'role',
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'owner_id');
    }

    public function favorites()
    {
        return $this->belongsToMany(Advertisement::class, 'favourites', 'user_id', 'advertisement_id');
    }


    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'evaluated_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }


    public function adRequests()
    {
        return $this->hasMany(AdRequest::class, 'sender_id');
    }

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class, 'user_id');
    }
}