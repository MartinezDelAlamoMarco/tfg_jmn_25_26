<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Vista de Anuncios (Compatible universalmente con MySQL/MariaDB en XAMPP)
        DB::statement("
            CREATE OR REPLACE VIEW view_advertisements_details AS
            SELECT a.id, a.price, a.description, a.description_en, a.views, a.is_rent, a.created_at, a.updated_at, a.status,
                   v.owner_id, u.name as owner_name, a.ad_state_id, s.name as state_name, a.province_id, p.name as province_name,
                   a.vehicle_id, v.km, v.year, v.power_hp, v.doors, v.model_id, m.name as model_name, m.brand_id, b.name as brand_name,
                   f.name as fuel_type_name, t.name as transmission_name, ton.name as tonality_name,
                   COALESCE(
                       (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('image_url', i.image_url, 'is_main', i.is_main) SEPARATOR ','), ']')
                        FROM advertisement_images i WHERE i.advertisement_id = a.id),
                   '[]') as images
            FROM advertisements a
            JOIN vehicles v ON a.vehicle_id = v.id
            JOIN users u ON v.owner_id = u.id
            JOIN vehicle_models m ON v.model_id = m.id
            JOIN vehicle_brands b ON m.brand_id = b.id
            JOIN provinces p ON a.province_id = p.id
            JOIN ad_states s ON a.ad_state_id = s.id
            JOIN fuel_types f ON v.fuel_type_id = f.id
            JOIN transmissions t ON v.transmission_id = t.id
            JOIN tonalities ton ON v.tonality_id = ton.id;
        ");

        // Vista de Conversaciones
        DB::statement("
            CREATE OR REPLACE VIEW view_conversations_details AS
            SELECT c.id, c.advertisement_id, c.buyer_id, c.seller_id, c.created_at, c.updated_at, c.status as chat_status,
                   a.status as ad_status, a.is_rent, CONCAT(b.name, ' ', m.name) as advertisement_title,
                   a.price as advertisement_price, b.name as brand_name, m.name as model_name,
                   ub.name as buyer_name, us.name as seller_name, a.reserved_until
            FROM conversations c
            JOIN advertisements a ON c.advertisement_id = a.id
            JOIN vehicles v ON a.vehicle_id = v.id
            JOIN vehicle_models m ON v.model_id = m.id
            JOIN vehicle_brands b ON m.brand_id = b.id
            JOIN users ub ON c.buyer_id = ub.id
            JOIN users us ON c.seller_id = us.id;
        ");

        // Vista de Reportes
        DB::statement("
            CREATE OR REPLACE VIEW view_reports_priority AS
            SELECT r.advertisement_id, r.report_type_id, rt.name as report_type_name,
                   COUNT(*) as total_reports, MAX(r.created_at) as last_report_at
            FROM reports r
            JOIN report_types rt ON r.report_type_id = rt.id
            WHERE r.status = 'pendiente'
            GROUP BY r.advertisement_id, r.report_type_id, rt.name
            ORDER BY COUNT(*) DESC;
        ");
    }

    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS view_reports_priority");
        DB::statement("DROP VIEW IF EXISTS view_conversations_details");
        DB::statement("DROP VIEW IF EXISTS view_advertisements_details");
    }
};