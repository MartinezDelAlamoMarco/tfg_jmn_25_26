<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use Google_Client;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Http; // <-- Importante para llamar a Make.com

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if (Auth::attempt($request->only(['email', 'password']))) {
                /** @var \App\Models\User $user */
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
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
        ]);

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
            'email' => 'required|email|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:255',
        ]);

        $user->update($request->only(['name', 'email', 'telephone']));

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
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'error' => 'La contraseña actual es incorrecta'
            ], 400);
        }

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

    public function googleLogin(Request $request)
    {
        try {
            $request->validate([
                'credential' => 'required|string',
            ]);

            $client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
            $payload = $client->verifyIdToken($request->credential);

            if (!$payload) {
                return response()->json(['error' => 'Token de Google inválido'], 401);
            }

            $googleEmail = $payload['email'];
            $googleName = $payload['name'];

            $user = User::where('email', $googleEmail)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleName,
                    'email' => $googleEmail,
                    'password' => Hash::make(Str::random(24)),
                ]);
            }

            $token = $user->createToken('API Token')->plainTextToken;

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

    // Método para solicitar el correo de recuperación
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'No encontramos ningún usuario con este correo electrónico.'
        ]);

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        $frontendUrl = env('FRONTEND_URL');
        $resetUrl = $frontendUrl . "/reset-password?token=" . $token . "&email=" . urlencode($request->email);

        // Conectamos con el Webhook de Make.com para enviar el correo de recuperación
        $makeWebhookUrl = env('MAKE_WEBHOOK_URL', 'https://hook.eu1.make.com/ft1torybdssigf2ott3uwf1kx6cnrlit');
        
        Http::post($makeWebhookUrl, [
            'email' => $request->email,
            'reset_url' => $resetUrl
        ]);

        return response()->json([
            'message' => 'Te hemos enviado un correo con el enlace de recuperación.'
        ], 200);
    }

    // Método para cambiar la contraseña usando el enlace
    public function resetPasswordWithToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols()
            ],
        ]);

        $resetRequest = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRequest || $resetRequest->token !== $request->token) {
            return response()->json(['error' => 'El token es inválido o ha expirado.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Borramos el token para que no se reutilice
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Contraseña actualizada correctamente.'], 200);
    }
}