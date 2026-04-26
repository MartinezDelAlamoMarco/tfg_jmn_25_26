<?php

use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\MyAdvertisementsController;
use App\Http\Controllers\MasterDataController;
use Illuminate\Support\Facades\Route;

// --- AUTENTICACIÓN ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

// --- GESTIÓN DE MIS ANUNCIOS (VENDEDOR) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-advertisements', [MyAdvertisementsController::class, 'index']);
    Route::post('/my-advertisements', [MyAdvertisementsController::class, 'store']);
    Route::delete('/my-advertisements/{id}', [MyAdvertisementsController::class, 'destroy']);
    Route::get('/my-advertisements/{id}', [MyAdvertisementsController::class, 'show']);
    Route::put('/my-advertisements/{id}', [MyAdvertisementsController::class, 'update']);
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
Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
Route::get('/advertisements', [AdvertisementController::class, 'index']);
Route::get('/advertisements/brand/{brand_id}', [AdvertisementController::class, 'byBrand']);

// --- FAVORITOS (ÁREA PERSONAL) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favorites', [AdvertisementController::class, 'favorites']);
    Route::post('/favorites/{id}', [AdvertisementController::class, 'addFavorite']);
    Route::delete('/favorites/{id}', [AdvertisementController::class, 'removeFavorite']);
});

// Ruta Ping para evitar el Cold Start en el hosting gratuito
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok', 
        'message' => '¡El servidor está despierto!'
    ], 200);
});