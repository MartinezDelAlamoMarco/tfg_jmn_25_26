<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('advertisement_id')->constrained('advertisements')->onDelete('cascade');
            $table->foreignId('report_type_id')->constrained('report_types');
            $table->text('description')->nullable(); // Solo necesario si elige "Otro"
            $table->enum('status', ['pendiente', 'resuelto', 'cancelado'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};