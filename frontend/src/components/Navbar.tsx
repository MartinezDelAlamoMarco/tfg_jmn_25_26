import { Link, useNavigate } from "react-router-dom"
import { APP_NAME } from "../config"
import logo from "../assets/Logotipo.png"

export default function Navbar() {
  const navigate = useNavigate();
  
  // Comprobamos si hay sesión activa
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Redirigimos al inicio y forzamos refresco para limpiar estados
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-zinc-900 text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-red-700 hover:text-red-600 transition-colors duration-300 ">
              <img src={logo} alt={`Logo de ${APP_NAME}`} className="h-10 w-auto object-contain"/> 
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar vehículos..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-red-700 transition-colors duration-300 font-medium">
              Inicio
            </Link>

            {/* SI NO HAY TOKEN: Mostramos Login y Register */}
            {!token ? (
              <>
                <Link to="/login" className="text-white hover:text-red-700 transition-colors duration-300 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300">
                  Register
                </Link>
              </>
            ) : (
              /* SI HAY TOKEN: Mostramos Mis Anuncios y Logout */
              <>
                <Link to="/mis-anuncios" className="text-white hover:text-red-700 transition-colors duration-300 font-medium flex items-center gap-2">
                   Mis Anuncios
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-zinc-700">
                  <span className="text-zinc-400 text-sm">Hola, <span className="text-white font-semibold">{user.name?.split(' ')[0]}</span></span>
                  <button 
                    onClick={handleLogout}
                    className="text-zinc-400 hover:text-red-500 text-sm transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-red-700 focus:outline-none p-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}