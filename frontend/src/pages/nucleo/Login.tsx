import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/login', { email, password })
      const { token, user } = response.data

      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Redirigir a home
      alert('Login exitoso')
    } catch (error) {
      console.error('Error en login:', error)
      alert('Credenciales inválidas')
    }
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      function handleCredentialResponse(response: any) {
        console.log("Encoded JWT ID token: " + response.credential)
        // Aquí puedes enviar el token a tu backend para autenticación
      }

      ;(window as any).google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Reemplaza con tu client ID real
        callback: handleCredentialResponse
      })
      ;(window as any).google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
      )
      ;(window as any).google.accounts.id.prompt() // also display the One Tap dialog
    }

    return () => {
      // Limpiar el script si el componente se desmonta
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
            <p className="text-zinc-400">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-800 text-zinc-400">O</span>
            </div>
          </div>

          <button
            onClick={() => {
              // Aquí puedes integrar el flujo de OAuth manualmente si no usas el botón oficial
              //window.location.href = 'https://google.com'
            }}
            className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 flex items-center justify-center border border-gray-300"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google Logo"
              className="w-5 h-5 mr-3"
            />
            Iniciar sesión con Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-red-500 hover:text-red-400 font-medium transition duration-200">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login