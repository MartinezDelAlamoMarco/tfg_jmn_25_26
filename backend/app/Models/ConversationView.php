<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationView extends Model
{
    // Apuntamos a la vista SQL corregida
    protected $table = 'view_conversations_details';

    // Como es una vista, desactivamos el autoincremento y los timestamps automáticos
    public $incrementing = false;
    public $timestamps = false;

    /**
     * Relación con los mensajes. 
     * Aunque sea una vista, podemos enlazarla con la tabla física de mensajes.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id', 'id');
    }
}