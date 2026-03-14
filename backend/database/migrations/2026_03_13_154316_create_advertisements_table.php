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
            $table->number('km');
            $table->number('year');
            $table->string('fuel_type');
            $table->string('transmission');
            $table->number('power_hp');
            $table->number('doors');
            $table->string('color');
            $table->text('description');
            $table->string('condition');
            $table->string('province');
            $table->number('views');
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('model_id')->references('model_id')->on('models')->onDelete('cascade')->onUpdate('cascade');
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
