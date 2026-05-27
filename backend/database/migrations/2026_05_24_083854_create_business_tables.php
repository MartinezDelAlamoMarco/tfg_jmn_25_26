<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('vehicle_brands')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });


        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->foreignId('fuel_type_id')->constrained('fuel_types');
            $table->foreignId('transmission_id')->constrained('transmissions');
            $table->foreignId('tonality_id')->constrained('tonalities');
            $table->integer('year');
            $table->integer('km');
            $table->integer('power_hp');
            $table->integer('doors');
            $table->timestamps();
        });


        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('province_id')->constrained('provinces');
            $table->foreignId('ad_state_id')->constrained('ad_states');
            $table->decimal('price', 12, 2);
            $table->text('description')->nullable();
            $table->integer('views')->default(0);
            $table->boolean('is_rent')->default(false);
            $table->text('description_en')->nullable();
            $table->string('status')->default('disponible');
            $table->foreignId('reserved_buyer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reserved_until')->nullable();
            $table->timestamps();
        });

        Schema::create('advertisement_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advertisement_id')->constrained('advertisements')->cascadeOnDelete();
            $table->string('image_url');
            $table->boolean('is_main')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisement_images');
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('vehicle_models');
    }
};