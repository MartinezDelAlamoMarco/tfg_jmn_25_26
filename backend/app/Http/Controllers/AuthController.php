<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if (Auth::attempt($request->only('email', 'password'))) {
                /** @var \App\Models\User $user */ // <-- Esta línea le dice a VS Code quién es $user
                $user = Auth::user();

                // Generamos el token
                $token = $user->createToken('API Token')->plainTextToken;

                return response()->json([
                    'user' => $user,
                    'token' => $token,
                ], 200);
            }

            return response()->json(['error' => 'Credenciales inválidas'], 401);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase() // Al menos una mayúscula y una minúscula
                    ->numbers()   // Al menos un número
                    ->symbols()   // Al menos un carácter especial (!, @, #, etc.)
                // ->uncompromised() // Opcional: Verifica que la contraseña no haya sido filtrada en hackeos conocidos
            ],
        ]);

        // El resto del código se mantiene igual
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // Actualizar datos básicos del perfil
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            // El email debe ser único, excepto para el ID del usuario actual
            'email' => 'required|email|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:255',
        ]);

        $user->update($request->only('name', 'email', 'telephone'));

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ], 200);
    }

    // Actualizar contraseña
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'password' => [
                'required',
                'confirmed', // Requiere que el frontend envíe 'password_confirmation'
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
        ]);

        // Verificar que la contraseña actual sea correcta
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'error' => 'La contraseña actual es incorrecta'
            ], 400);
        }

        // Actualizar la contraseña hasheada
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada correctamente'
        ], 200);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
