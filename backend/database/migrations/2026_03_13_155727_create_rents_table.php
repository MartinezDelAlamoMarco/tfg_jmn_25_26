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
        Schema::create('rents', function (Blueprint $table) {
            $table->id('rent_id');
            $table->unsignedBigInteger('advertisement_id');
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('renter_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price', 8,2);
            $table->timestamps();

            $table->foreign('advertisement_id')->references('advertisement_id')->on('advertisements')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('owner_id')->references('user_id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('renter_id')->references('user_id')->on('users')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rents');
    }
};
