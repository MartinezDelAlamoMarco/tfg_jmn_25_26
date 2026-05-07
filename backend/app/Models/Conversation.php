<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['advertisement_id', 'buyer_id', 'seller_id'];

    // Relación con el anuncio
    public function advertisement() {
        return $this->belongsTo(Advertisement::class);
    }

    // Relación con el usuario que compra
    public function buyer() {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // Relación con el usuario que vende
    public function seller() {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Relación con los mensajes del chat
    public function messages() {
        return $this->hasMany(Message::class);
    }
}