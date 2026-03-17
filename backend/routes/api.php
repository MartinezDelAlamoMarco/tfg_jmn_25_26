<?php

use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\MyAdvertisements;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']); // Para obtener datos del usuario logueado

Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'find'])->whereNumber('id');
Route::get('/vehicles/brand/{brand_id}', [VehicleController::class, 'vehicleByBrand'])->whereNumber('brand_id');

Route::get('/brands', [VehicleController::class, 'brands']);

Route::get('/users/{userId}/advertisements', [MyAdvertisements::class, 'index']);

Route::get('/vehicles/{id}', [VehicleController::class, 'show']);

Route::get('/advertisements', [AdvertisementController::class, 'index']);
Route::get('/advertisements/brand/{brand_id}', [AdvertisementController::class, 'byBrand'])->whereNumber('brand_id');