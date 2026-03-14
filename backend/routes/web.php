<?php

use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

Route::get('/vehicle/{id}', [VehicleController::class, 'show_vehicle'])->name('vehicle.index');