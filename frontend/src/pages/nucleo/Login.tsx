import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' 
import axios from "axios";
import { API_BASE_URL } from "../../config";
import LoadingScreen from "../../components/LoadingScreen"; // Importamos tu nuevo componente

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Estado para la ruletita

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true); // Arrancamos la carga

    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
        const { token, user } = response.data;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        window.location.href = '/'; 
    } catch (error) {
        setIsLoggingIn(false); // Paramos la carga si falla
        alert('Credenciales inválidas');
    }
  };

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      function handleCredentialResponse(response: any) {
        console.log("Encoded JWT ID token: " + response.credential)
      }

      ;(window as any).google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", 
        callback: handleCredentialResponse
      })
      ;(window as any).google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }
      )
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Si estamos en proceso de login, mostramos la ruletita
  if (isLoggingIn) {
    return <LoadingScreen message="Validando credenciales..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 italic uppercase tracking-tighter">
              Redline <span className="text-red-600">Motors</span>
            </h1>
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
              className="w-full bg-red-700 hover:bg-red-600 text-white font-black uppercase py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-red-900/20 active:scale-95"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-800 text-zinc-400 font-bold uppercase italic">O</span>
            </div>
          </div>

          <div id="buttonDiv" className="w-full flex justify-center"></div>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-red-500 hover:text-red-400 font-bold transition duration-200">
                REGÍSTRATE
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login