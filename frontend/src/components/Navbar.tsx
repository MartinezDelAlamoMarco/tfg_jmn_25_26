import { useState } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config";
import logo from "../assets/Logotipo.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setIsMobileMenuOpen(false);
    window.location.href = "/";
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="w-full bg-zinc-900 text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-red-700 hover:text-red-600 transition-colors duration-300">
              <img src={logo} alt={`Logo de ${APP_NAME}`} className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input type="text" placeholder="Buscar vehículos..." className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-red-700 transition-colors duration-300 font-medium">
              Inicio
            </Link>
            
            {/* NUEVO: Enlace de Alquileres en Desktop */}
            <Link to="/alquileres" className="text-white hover:text-red-700 transition-colors duration-300 font-medium">
              Alquileres
            </Link>

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
              <>
                <Link to="/favoritos" className="text-white hover:text-red-700 transition-colors duration-300 font-medium flex items-center gap-2">
                  Favoritos
                </Link>
                <Link to="/mis-anuncios" className="text-white hover:text-red-700 transition-colors duration-300 font-medium flex items-center gap-2">
                  Mis Anuncios
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-zinc-700">
                  <span className="text-zinc-400 text-sm">
                    Hola, <span className="text-white font-semibold">{user.name?.split(" ")[0]}</span>
                  </span>
                  <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 text-sm transition-colors">
                    Salir
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-red-700 focus:outline-none p-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 shadow-xl pb-4">
          <div className="px-4 pt-4 space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input type="text" placeholder="Buscar vehículos..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition duration-200" />
            </div>

            <div className="flex flex-col space-y-1">
              <Link to="/" onClick={closeMenu} className="px-2 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg font-medium transition-colors">
                Inicio
              </Link>

              {/* NUEVO: Enlace de Alquileres en Móvil */}
              <Link to="/alquileres" onClick={closeMenu} className="px-2 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg font-medium transition-colors">
                Alquileres
              </Link>

              {token && (
                <>
                  <Link to="/favoritos" onClick={closeMenu} className="px-2 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg font-medium transition-colors">
                    Favoritos
                  </Link>
                  <Link to="/mis-anuncios" onClick={closeMenu} className="px-2 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg font-medium transition-colors">
                    Mis Anuncios
                  </Link>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800/80">
              {!token ? (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={closeMenu} className="w-full flex justify-center items-center py-2.5 px-4 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl font-medium transition-all duration-200">
                    Iniciar sesión
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="w-full flex justify-center items-center py-2.5 px-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-900/20">
                    Crear cuenta
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-zinc-300 text-sm">
                      Hola, <span className="text-white font-semibold">{user.name?.split(" ")[0]}</span>
                    </span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}