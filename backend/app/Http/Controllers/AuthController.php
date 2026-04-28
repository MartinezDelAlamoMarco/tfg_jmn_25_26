<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
// 👇 NUEVOS IMPORTS AÑADIDOS PARA GOOGLE 👇
use Google_Client;
use Illuminate\Support\Str;

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

    // 👇 NUEVO MÉTODO PARA EL LOGIN CON GOOGLE 👇
    public function googleLogin(Request $request)
    {
        try {
            $request->validate([
                'credential' => 'required|string',
            ]);

            // 1. Verificar el token de Google
            $client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
            $payload = $client->verifyIdToken($request->credential);

            if (!$payload) {
                return response()->json(['error' => 'Token de Google inválido'], 401);
            }

            // 2. Extraer datos del usuario que nos da Google
            $googleEmail = $payload['email'];
            $googleName = $payload['name'];

            // 3. Buscar si el usuario ya existe en nuestra base de datos
            $user = User::where('email', $googleEmail)->first();

            // Si no existe, lo registramos automáticamente
            if (!$user) {
                $user = User::create([
                    'name' => $googleName,
                    'email' => $googleEmail,
                    // Generamos una contraseña súper segura de 24 caracteres aleatorios
                    // ya que el usuario siempre entrará con Google y no la necesita
                    'password' => Hash::make(Str::random(24)),
                    // Si tienes un campo 'role' en la BD con un valor por defecto, 
                    // Laravel lo asignará automáticamente.
                ]);
            }

            // 4. Generamos nuestro token de Sanctum (igual que en login/register)
            $token = $user->createToken('API Token')->plainTextToken;

            // 5. Devolvemos exactamente la misma estructura que espera tu Frontend
            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error validando con Google',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}