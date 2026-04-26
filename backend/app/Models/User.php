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

    /**
     * Los atributos que se pueden rellenar de forma masiva.
     * Aquí añadimos 'telephone' y 'role'.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telephone',
        'role',
    ];

    /**
     * Atributos que deben ocultarse en las respuestas de la API (JSON).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Atributos que deben convertirse a tipos nativos.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // =========================================================
    // RELACIONES ELOQUENT (Lógica de Redline Motors)
    // =========================================================

    /**
     * Un usuario posee varios vehículos.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'owner_id');
    }

    /**
     * Un usuario puede guardar muchos anuncios en favoritos.
     */
    public function favorites()
    {
        return $this->belongsToMany(Advertisement::class, 'favourites', 'user_id', 'advertisement_id');
    }

    /**
     * Valoraciones que ha RECIBIDO este usuario (como vendedor).
     */
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'evaluated_id');
    }

    /**
     * Valoraciones que ha ESCRITO este usuario (como comprador).
     */
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    /**
     * Solicitudes de contacto/reserva que ha enviado el usuario.
     */
    public function adRequests()
    {
        return $this->hasMany(AdRequest::class, 'sender_id');
    }
}