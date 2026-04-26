<?php

use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\MyAdvertisements;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\RentController;
use Illuminate\Support\Facades\Route;

// --- AUTENTICACIÓN ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

// --- GESTIÓN DE MIS ANUNCIOS (VENDEDOR) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-advertisements', [MyAdvertisements::class, 'index']);
    Route::post('/my-advertisements', [MyAdvertisements::class, 'store']);
    Route::delete('/my-advertisements/{id}', [MyAdvertisements::class, 'destroy']);
    Route::get('/my-advertisements/{id}', [MyAdvertisements::class, 'show']);
    Route::put('/my-advertisements/{id}', [MyAdvertisements::class, 'update']);
});

// --- SELECTORES DINÁMICOS (CATÁLOGOS) ---
Route::get('/brands', [MasterDataController::class, 'getBrands']);
Route::get('/brands/{brandId}/models', [MasterDataController::class, 'getModelsByBrand']);
Route::get('/provinces', [MasterDataController::class, 'getProvinces']);
Route::get('/fuel-types', [MasterDataController::class, 'getFuelTypes']);
Route::get('/tonalities', [MasterDataController::class, 'getTonalities']);
Route::get('/transmissions', [MasterDataController::class, 'getTransmissions']);

// --- CONSULTAS PÚBLICAS (CATÁLOGO GENERAL) ---
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'show']); // Solo una ruta para el ID
Route::get('/advertisements', [AdvertisementController::class, 'index']);
Route::get('/advertisements/brand/{brand_id}', [AdvertisementController::class, 'byBrand']);

// --- GESTIÓN DE ALQUILERES (RENTS) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/rents', [RentController::class, 'store']);
    Route::get('/my-rents', [RentController::class, 'myRents']);
});