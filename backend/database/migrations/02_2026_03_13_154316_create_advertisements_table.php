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
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id('advertisement_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('model_id');
            $table->decimal('price', 8,2);
            $table->integer('km');
            $table->integer('year');
            $table->string('fuel_type');
            $table->string('transmission');
            $table->integer('power_hp');
            $table->integer('doors');
            $table->string('color');
            $table->text('description');
            $table->string('vehicle_condition');
            $table->string('province');
            $table->integer('views');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('model_id')->references('id')->on('vehicle_models')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
