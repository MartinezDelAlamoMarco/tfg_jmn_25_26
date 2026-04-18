<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdRequest extends Model {
    public function advertisement() { return $this->belongsTo(Advertisement::class); }
    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}
