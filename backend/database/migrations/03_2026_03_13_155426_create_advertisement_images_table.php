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
        Schema::create('advertisement_images', function (Blueprint $table) {
            $table->id('image_id');
            $table->unsignedBigInteger('advertisement_id');
            $table->string('image_url');
            $table->integer('position');
            $table->timestamps();

            $table->foreign('advertisement_id')->references('advertisement_id')->on('advertisements')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisement_images');
    }
};
