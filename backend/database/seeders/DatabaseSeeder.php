<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear Usuarios de prueba (Un Admin y un Usuario normal)
        DB::table('users')->insert([
            [
                'name' => 'Admin Plataforma',
                'email' => 'admin@nujamamotors.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'telephone' => '600111222',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nuria (Vendedora)',
                'email' => 'nuria@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'telephone' => '600333444',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 2. Poblar Catálogos Básicos
        
        // Marcas
        $brands = ['Audi', 'BMW', 'Mercedes-Benz', 'Toyota', 'Ford', 'Honda', 'Seat', 'Renault', 'Volkswagen', 'Peugeot'];
        foreach ($brands as $brand) {
            DB::table('vehicle_brands')->insert(['name' => $brand, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Tipos de Combustible
        $fuels = ['Diésel', 'Gasolina', 'Híbrido', 'Híbrido Enchufable', 'Eléctrico'];
        foreach ($fuels as $fuel) {
            DB::table('fuel_types')->insert(['name' => $fuel, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Transmisiones
        $transmissions = ['Manual', 'Automático'];
        foreach ($transmissions as $transmission) {
            DB::table('transmissions')->insert(['name' => $transmission, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Tonalidades / Colores
        $tonalities = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde'];
        foreach ($tonalities as $color) {
            DB::table('tonalities')->insert(['name' => $color, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Estados del Anuncio
        $adStates = ['Nuevo', 'Seminuevo', 'Segunda mano', 'Para piezas'];
        foreach ($adStates as $state) {
            DB::table('ad_states')->insert(['name' => $state, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Tipos de Reporte
        $reportTypes = ['Fraude o estafa', 'Vehículo ya vendido', 'Precio falso', 'Contenido inapropiado', 'Spam'];
        foreach ($reportTypes as $type) {
            DB::table('report_types')->insert(['name' => $type, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Provincias
        $provinces = ['Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Gipuzkoa', 'Huelva', 'Huesca', 'Illes Balears', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Santa Cruz de Tenerife', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza', 'Ceuta', 'Melilla'];
        foreach ($provinces as $province) {
            DB::table('provinces')->insert(['name' => $province, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 3. Llamar al seeder de los vehículos de prueba (TestDataSeeder)
        $this->call([
            TestDataSeeder::class,
        ]);
    }
}