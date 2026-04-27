<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE VIEW view_reports_priority AS
            SELECT 
                r.advertisement_id,
                r.report_type_id,
                rt.name AS report_type_name,
                COUNT(*) AS total_reports,
                MAX(r.created_at) AS last_report_at
            FROM 
                reports r
            JOIN 
                report_types rt ON r.report_type_id = rt.id
            WHERE 
                r.status = 'pendiente'
            GROUP BY 
                r.advertisement_id, r.report_type_id, rt.name
        ");
    }

    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS view_reports_priority");
    }
};