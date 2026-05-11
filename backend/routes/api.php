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
use App\Http\Controllers\ChatController;
use App\Http\Controllers\RentController;  // ← NUEVO
use Illuminate\Support\Facades\Route;

// --- RUTAS PÚBLICAS ---

// Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
Route::post('/reset-password', [AuthController::class, 'resetPasswordWithToken']);

// Selectores dinámicos
Route::get('/brands', [MasterDataController::class, 'getBrands']);
Route::get('/brands/{brandId}/models', [MasterDataController::class, 'getModelsByBrand']);
Route::get('/provinces', [MasterDataController::class, 'getProvinces']);
Route::get('/fuel-types', [MasterDataController::class, 'getFuelTypes']);
Route::get('/tonalities', [MasterDataController::class, 'getTonalities']);
Route::get('/transmissions', [MasterDataController::class, 'getTransmissions']);

// Catálogo general
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
Route::get('/advertisements', [AdvertisementController::class, 'index']);
Route::get('/advertisements/brand/{brand_id}', [AdvertisementController::class, 'byBrand']);
Route::get('/advertisement/{id}', [AdvertisementController::class, 'show']);

// Perfiles públicos y sus valoraciones
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/users/{id}/advertisements', [UserController::class, 'advertisements']);
Route::get('/users/{id}/reviews', [ReviewController::class, 'index']);

// Reportes (Tipos)
Route::get('/report-types', [ReportController::class, 'getTypes']);

// --- RUTAS PROTEGIDAS (REQUIEREN LOGIN / SANCTUM) ---

Route::middleware('auth:sanctum')->group(function () {

    // 1. Gestión del Perfil Propio
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // 2. Mis Anuncios (Vendedor)
    Route::get('/my-advertisements', [MyAdvertisementsController::class, 'index']);
    Route::post('/my-advertisements', [MyAdvertisementsController::class, 'store']);
    Route::get('/my-advertisements/{id}', [MyAdvertisementsController::class, 'show']);
    Route::put('/my-advertisements/{id}', [MyAdvertisementsController::class, 'update']);
    Route::delete('/my-advertisements/{id}', [MyAdvertisementsController::class, 'destroy']);

    // Confirmación de compra por parte del comprador (desde VehicleDetail)
    Route::post('/advertisements/{id}/buyer-confirm', [AdvertisementController::class, 'buyerConfirm']);

    // 3. Favoritos y Reportes
    Route::get('/favorites', [AdvertisementController::class, 'favorites']);
    Route::post('/favorites/{id}', [AdvertisementController::class, 'addFavorite']);
    Route::delete('/favorites/{id}', [AdvertisementController::class, 'removeFavorite']);
    Route::post('/reports', [ReportController::class, 'store']);

    // 4. VALORACIONES (REVIEWS)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/users/{id}/can-review', [ReviewController::class, 'canReview']);

    // 5. CHAT EN TIEMPO REAL Y GESTIÓN DE VENTA
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::post('/conversations', [ChatController::class, 'startConversation']);
    Route::get('/conversations/{id}', [ChatController::class, 'getMessages']);
    Route::post('/conversations/{id}/messages', [ChatController::class, 'sendMessage']);
    Route::delete('/conversations/{id}', [ChatController::class, 'destroy']);

    // Marcar mensajes como leídos
    Route::post('/conversations/{id}/read', [ChatController::class, 'markAsRead']);

    // Lógica de negocio de la transacción
    Route::post('/conversations/{id}/reserve', [ChatController::class, 'reserve']);
    Route::post('/conversations/{id}/cancel-reserve', [ChatController::class, 'cancelReserve']);
    Route::post('/conversations/{id}/sell', [ChatController::class, 'confirmSale']);

    // 6. ALQUILERES
    Route::post('/rents', [RentController::class, 'store']);
    Route::get('/my-rents', [RentController::class, 'myRents']);

    // 7. PANEL DE ADMINISTRACIÓN (Solo Admin)
    Route::get('/admin/reports-priority', [ReportController::class, 'getPriorityReports']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::patch('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    Route::get('/admin/ads', [AdminAdController::class, 'index']);
    Route::patch('/admin/ads/{id}/state', [AdminAdController::class, 'updateState']);
    Route::delete('/advertisement/{id}', [AdvertisementController::class, 'destroy']);
});

// Ping de salud
Route::get('/ping', function () {
    return response()->json(['status' => 'ok', 'message' => '¡El servidor está despierto!'], 200);
});