<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('model_id')->constrained('vehicle_models')->onDelete('cascade');
            $table->foreignId('fuel_type_id')->constrained('fuel_types');
            $table->foreignId('transmission_id')->constrained('transmissions');
            $table->foreignId('tonality_id')->constrained('tonalities');
            $table->integer('year');
            $table->integer('km');
            $table->integer('power_hp');
            $table->integer('doors');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
