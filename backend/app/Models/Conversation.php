<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['advertisement_id', 'buyer_id', 'seller_id'];

    public function messages() {
        return $this->hasMany(Message::class);
    }

    public function advertisement() {
        return $this->belongsTo(Advertisement::class);
    }

    public function buyer() {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller() {
        return $this->belongsTo(User::class, 'seller_id');
    }
}