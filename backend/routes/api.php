<?php

use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'find'])->whereNumber('id');
Route::get('/vehicles/brand/{brand_id}', [VehicleController::class, 'vehicleByBrand'])->whereNumber('brand_id');

Route::get('/brands', [VehicleController::class, 'brands']);