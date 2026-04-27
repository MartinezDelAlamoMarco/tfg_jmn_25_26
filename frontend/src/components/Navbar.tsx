import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config";
import logo from "../assets/Logotipo.png";
import { ChevronDown, User, LayoutDashboard, LogOut, Heart } from "lucide-react"; // Importamos iconos

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    window.location.href = "/";
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Cerrar el dropdown si se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-zinc-900 text-white border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/" onClick={closeMenus} className="flex items-center gap-2 text-2xl font-bold text-red-700 hover:text-red-600 transition-colors duration-300">
              <img src={logo} alt={`Logo de ${APP_NAME}`} className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* Buscador (Solo Desktop) */}
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

          {/* Enlaces Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-zinc-300 hover:text-white transition-colors duration-300 font-medium">Inicio</Link>
            <Link to="/alquileres" className="text-zinc-300 hover:text-white transition-colors duration-300 font-medium">Alquileres</Link>

            {!token ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-white hover:text-red-700 transition-colors duration-300 font-medium">Login</Link>
                <Link to="/register" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300">Register</Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {/* Favoritos se queda fuera como pediste */}
                <Link to="/favoritos" className="text-zinc-300 hover:text-red-500 transition-colors duration-300 font-medium flex items-center gap-2">
                  <Heart size={18} />
                  Favoritos
                </Link>

                {/* Dropdown de Usuario */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 pl-4 border-l border-zinc-700 group focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 font-bold group-hover:border-red-500 transition-colors">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-300 text-sm group-hover:text-white transition-colors">
                        Hola, <span className="text-white font-semibold">{user.name?.split(" ")[0]}</span>
                      </span>
                      <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Menú Desplegable Real */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                      <Link 
                        to="/mis-anuncios" 
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Mis Anuncios
                      </Link>
                      <Link 
                        to="/perfil" 
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <User size={16} />
                        Gestionar Perfil
                      </Link>
                      <hr className="my-2 border-zinc-800" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
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

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 shadow-xl pb-6">
          <div className="px-4 pt-4 space-y-4">
            <div className="flex flex-col space-y-1">
              <Link to="/" onClick={closeMenus} className="px-2 py-2 text-zinc-300 hover:text-white font-medium">Inicio</Link>
              <Link to="/alquileres" onClick={closeMenus} className="px-2 py-2 text-zinc-300 hover:text-white font-medium">Alquileres</Link>
              {token && (
                <Link to="/favoritos" onClick={closeMenus} className="px-2 py-2 text-zinc-300 hover:text-red-500 font-medium flex items-center gap-2">
                   <Heart size={18} /> Favoritos
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              {!token ? (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={closeMenus} className="w-full text-center py-2.5 border border-zinc-700 text-zinc-300 rounded-xl font-medium">Iniciar sesión</Link>
                  <Link to="/register" onClick={closeMenus} className="w-full text-center py-2.5 bg-red-700 text-white rounded-xl font-medium">Crear cuenta</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold leading-none">{user.name}</p>
                      <p className="text-zinc-500 text-xs mt-1">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Link to="/mis-anuncios" onClick={closeMenus} className="px-2 py-2 text-zinc-400 hover:text-white flex items-center gap-3">
                      <LayoutDashboard size={18} /> Mis Anuncios
                    </Link>
                    <Link to="/perfil" onClick={closeMenus} className="px-2 py-2 text-zinc-400 hover:text-white flex items-center gap-3">
                      <User size={18} /> Gestionar Perfil
                    </Link>
                    <button onClick={handleLogout} className="px-2 py-2 text-red-500 flex items-center gap-3">
                      <LogOut size={18} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}