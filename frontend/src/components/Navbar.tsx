import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config";
import logo from "../assets/Logotipo.png";
import { ChevronDown, User, LayoutDashboard, LogOut, Heart, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = localStorage.getItem("user_role");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    window.location.href = "/";
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

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
            <Link to="/" onClick={closeMenus} className="flex items-center gap-2">
              <img src={logo} alt={`Logo de ${APP_NAME}`} className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* Buscador */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input type="text" placeholder="Buscar vehículos..." className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200" />
            </div>
          </div>

          {/* Enlaces Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-zinc-300 hover:text-white transition-colors font-medium">Inicio</Link>
            <Link to="/alquileres" className="text-zinc-300 hover:text-white transition-colors font-medium">Alquileres</Link>

            {!token ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-white hover:text-red-700 transition-colors font-medium">Login</Link>
                <Link to="/register" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Register</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4"> {/* Contenedor de elementos de usuario logueado */}
                
                <Link to="/favoritos" className="text-zinc-300 hover:text-red-500 transition-colors font-medium flex items-center gap-2 mr-2">
                  <Heart size={18} />
                  Favoritos
                </Link>

                {/* Dropdown de Usuario (Saludando) */}
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

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                      <Link to="/mis-anuncios" onClick={closeMenus} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                        <LayoutDashboard size={16} /> Mis Anuncios
                      </Link>
                      <Link to="/perfil" onClick={closeMenus} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                        <User size={16} /> Gestionar Perfil
                      </Link>
                      <hr className="my-2 border-zinc-800" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                        <LogOut size={16} /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>

                {/* AQUÍ ESTÁ EL CAMBIO: Panel de Moderación a la derecha del saludo */}
                {userRole === 'admin' && (
                  <Link 
                    to="/admin/panel" 
                    className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all font-bold text-xs uppercase tracking-tighter shadow-lg shadow-red-900/20"
                  >
                    <ShieldAlert size={16} />
                    Panel Moderación
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Menú Móvil */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-red-700 p-2">
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

      {/* Menú Móvil Expandido */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 shadow-xl pb-6">
          <div className="px-4 pt-4 space-y-4">
            <Link to="/" onClick={closeMenus} className="block px-2 py-2 text-zinc-300 font-medium">Inicio</Link>
            <Link to="/alquileres" onClick={closeMenus} className="block px-2 py-2 text-zinc-300 font-medium">Alquileres</Link>
            
            {token && userRole === 'admin' && (
              <Link to="/admin/panel" onClick={closeMenus} className="block px-2 py-2 text-red-500 font-bold flex items-center gap-2">
                 <ShieldAlert size={18} /> Panel Moderación
              </Link>
            )}
            
            {/* ... resto del menú móvil ... */}
          </div>
        </div>
      )}
    </nav>
  );
}