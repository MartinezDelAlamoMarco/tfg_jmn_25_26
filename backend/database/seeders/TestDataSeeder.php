<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear Modelos de Vehículos 
        // Seat = 7 (según el DatabaseSeeder), BMW = 2
        DB::table('vehicle_models')->insert([
            ['brand_id' => 7, 'name' => 'Altea', 'created_at' => now(), 'updated_at' => now()],
            ['brand_id' => 2, 'name' => 'Serie 3', 'created_at' => now(), 'updated_at' => now()]
        ]);

        // 2. Crear Vehículos (Asignados a tu usuario, el ID 2)
        DB::table('vehicles')->insert([
            [
                'owner_id' => 2,
                'model_id' => 1, // Altea
                'fuel_type_id' => 1, // Diésel
                'transmission_id' => 1, // Manual
                'tonality_id' => 1, // Blanco
                'year' => 2012, 
                'km' => 120000,
                'power_hp' => 140,
                'doors' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'owner_id' => 2,
                'model_id' => 2, // Serie 3
                'fuel_type_id' => 1, // Diésel
                'transmission_id' => 1, // Manual
                'tonality_id' => 2, // Negro
                'year' => 2019,
                'km' => 85000,
                'power_hp' => 190,
                'doors' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 3. Crear Anuncios
        DB::table('advertisements')->insert([
            [
                'vehicle_id' => 1,
                'province_id' => 30, // Madrid
                'ad_state_id' => 3, // Segunda mano
                'price' => 6500.00,
                'description' => 'Seat Altea en perfecto estado, muy amplio e ideal para familias. Revisiones al día y siempre en garaje.',
                'description_en' => 'Seat Altea in perfect condition, very spacious and ideal for families. Full service history and always garaged.',
                'views' => 45,
                'is_rent' => false,
                'status' => 'disponible',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vehicle_id' => 2,
                'province_id' => 8, // Barcelona
                'ad_state_id' => 3, // Segunda mano
                'price' => 50.00, // Precio por día de alquiler
                'description' => 'Se alquila BMW Serie 3 para eventos o fines de semana. Muy cómodo y bajo consumo.',
                'description_en' => 'BMW Series 3 for rent for events or weekends. Very comfortable and low consumption.',
                'views' => 120,
                'is_rent' => true,
                'status' => 'disponible',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 4. Asignar las Imágenes Locales a los Anuncios
        DB::table('advertisement_images')->insert([
            [
                'advertisement_id' => 1,
                'image_url' => 'http://localhost:8000/storage/test_cars/car1.jpg',
                'is_main' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'advertisement_id' => 2,
                'image_url' => 'http://localhost:8000/storage/test_cars/car2.jpg',
                'is_main' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}