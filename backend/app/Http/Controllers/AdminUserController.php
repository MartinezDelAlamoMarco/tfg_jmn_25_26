<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\GoogleDriveService;

class AdminUserController extends Controller
{
    // Cuenta protegida para el TFG
    const SUPER_ADMIN_EMAIL = 'admin@nujamamotors.com';
    
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    public function index(Request $request)
    {
        $search = $request->query('search');

        $users = User::when($search, function ($query, $search) {
            return $query->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('id', '=', is_numeric($search) ? $search : null);
        })
        ->orderBy('id', 'desc')
        ->paginate(15);

        return response()->json($users);
    }

    public function updateRole(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        if ($user->email === self::SUPER_ADMIN_EMAIL) {
            return response()->json(['message' => 'No se puede modificar al Administrador Supremo.'], 403);
        }

        $request->validate(['role' => 'required|in:admin,user']);

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => "Rol actualizado correctamente"]);
    }

    public function destroy(int $id)
    {
        // 1. Cargamos al usuario con TODA la jerarquía de anuncios y fotos para no dejar basura
        $user = User::with(['vehicles.advertisement.images'])->findOrFail($id);

        // 2. Protecciones de seguridad
        if ($user->email === self::SUPER_ADMIN_EMAIL) {
            return response()->json(['message' => 'El Administrador Supremo es intocable.'], 403);
        }

        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 403);
        }

        // 3. --- LIMPIEZA MULTIPLE DE GOOGLE DRIVE ---
        // Recorremos cada vehículo del usuario para limpiar sus fotos en la nube
        foreach ($user->vehicles as $vehicle) {
            if ($vehicle->advertisement) {
                foreach ($vehicle->advertisement->images as $image) {
                    
                    // Reutilizamos tu lógica de parseo de URL para extraer el ID de Drive
                    $urlParts = parse_url($image->image_url);
                    parse_str($urlParts['query'] ?? '', $queryParams);
                    $fileId = $queryParams['id'] ?? null;

                    if ($fileId) {
                        try {
                            $this->driveService->deleteFile($fileId);
                        } catch (\Exception $e) {
                            Log::warning("Error eliminando foto de Drive ({$fileId}) al borrar usuario {$id}");
                        }
                    }
                }
            }
        }

        // 4. Borrado definitivo en la base de datos
        // El CASCADE eliminará automáticamente los registros en 'vehicles', 'advertisements', 'reports', etc. [cite: 2, 23, 28]
        $user->delete();

        return response()->json(['message' => 'Usuario y todos sus recursos multimedia eliminados con éxito']);
    }
}