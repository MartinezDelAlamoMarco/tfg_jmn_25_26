<?php

use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\MyAdvertisementsController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\ReportController; 
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminAdController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// --- AUTENTICACIÓN Y PERFIL ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
Route::post('/reset-password', [AuthController::class, 'resetPasswordWithToken']);

// Agrupamos todas las rutas que gestionan al usuario logueado
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
});

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

// --- REPORTES (DENUNCIAS PÚBLICAS) ---
Route::get('/report-types', [ReportController::class, 'getTypes']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reports', [ReportController::class, 'store']);
});

// --- PANEL DE ADMINISTRACIÓN (FUNCIONALIDAD AVANZADA) ---
// Estas rutas solo son accesibles para usuarios autenticados (Admin)
Route::middleware('auth:sanctum')->group(function () {
    
    // 1. Gestión de Reportes
    Route::get('/admin/reports-priority', [ReportController::class, 'getPriorityReports']);

    // 2. Gestión de Usuarios (Moderación)
    Route::get('/admin/users', [AdminUserController::class, 'index']); // Listar y buscar
    Route::patch('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']); // Modificar rol
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']); // Eliminar usuario

    // 3. Gestión de Anuncios (Moderación)
    Route::get('/admin/ads', [AdminAdController::class, 'index']); // Listar anuncios con la Vista SQL
    Route::patch('/admin/ads/{id}/state', [AdminAdController::class, 'updateState']); // Cambiar estado del anuncio
    Route::delete('/advertisements/{id}', [AdvertisementController::class, 'destroy']); // Borrado físico (ya la tenías)
});

// Ruta Ping para evitar el Cold Start
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok', 
        'message' => '¡El servidor está despierto!'
    ], 200);
});

// Public user endpoints + reviews
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/users/{id}/advertisements', [UserController::class, 'advertisements']);
Route::get('/users/{id}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/{id}/can-review', [ReviewController::class, 'canReview']);
    Route::post('/users/{id}/reviews', [ReviewController::class, 'store']);
});