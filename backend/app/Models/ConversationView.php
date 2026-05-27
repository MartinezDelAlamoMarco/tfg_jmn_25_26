<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationView extends Model
{
    protected $table = 'view_conversations_details';

    public $incrementing = false;
    public $timestamps = false;

    
    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id', 'id');
    }
}