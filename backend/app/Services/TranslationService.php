<?php

namespace App\Services;

use Stichoza\GoogleTranslate\GoogleTranslate;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    public function translateToEnglish(?string $text): ?string
    {
        if (empty($text)) {
            return $text;
        }

        try {
            $tr = new GoogleTranslate();
            $tr->setSource('es'); 
            $tr->setTarget('en');
            
            return $tr->translate($text);
            
        } catch (\Exception $e) {
            Log::error('Error en Stichoza Translation: ' . $e->getMessage());
            return null; // Si falla, guardará null y el frontend mostrará el texto en español por defecto por si las moscas
        }
    }
}