<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    // Nombre de la tabla (opcional ya que coincide con el plural por defecto de Laravel)
    protected $table = 'transactions';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'advertisement_id',
        'buyer_id',
        'seller_id',
        'final_price',
        'date',
    ];

    // Conversión de tipos nativos de Eloquent
    protected $casts = [
        'final_price' => 'decimal:2',
        'date' => 'date',
    ];

    /**
     * Obtiene el anuncio asociado a la transacción.
     */
    public function advertisement(): BelongsTo
    {
        return $this->belongsTo(Advertisement::class, 'advertisement_id');
    }

    /**
     * Obtiene el usuario que actuó como comprador en la transacción.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Obtiene el usuario que actuó como vendedor en la transacción.
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}