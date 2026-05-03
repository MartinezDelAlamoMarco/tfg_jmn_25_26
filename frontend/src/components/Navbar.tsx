import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { APP_NAME, API_BASE_URL } from "../config"; // Asegúrate de importar API_BASE_URL
import logo from "../assets/Logotipo.png";
import esFlag from "../assets/flag-es.svg";
import gbFlag from "../assets/flag-gb.svg";
import { ChevronDown, User, LayoutDashboard, LogOut, Heart, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- AÑADIDO: Importación para idiomas

export default function Navbar() {
  const { t, i18n } = useTranslation(); // <-- AÑADIDO: Hook de traducción

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = localStorage.getItem("user_role");

  // --- NUEVOS ESTADOS PARA LIVE SEARCH ---
  const [allAds, setAllAds] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cargar anuncios al montar
  useEffect(() => {
    axios.get(`${API_BASE_URL}/advertisements`)
      .then(res => setAllAds(res.data))
      .catch(err => console.error("Error cargando anuncios", err));
  }, []);

  // Limpiar buscador al cambiar de página
  useEffect(() => {
    setSearchTerm("");
    setShowSuggestions(false);
    closeMenus();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    window.location.href = "/";
  };

  // Función para manejar la búsqueda al darle enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    }
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // <-- AÑADIDO: Función para cambiar de idioma
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Clic fuera para cerrar menús y buscador
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      // Añadido para cerrar el buscador
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LÓGICA DE SUGERENCIAS ---
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    
    return allAds.filter(ad => {
      const searchString = `${ad.brand_name} ${ad.model_name} ${ad.province_name} ${ad.year}`.toLowerCase();
      return searchString.includes(query);
    }).slice(0, 5); // Máximo 5 resultados
  }, [searchTerm, allAds]);

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

          {/* Buscador - MODIFICADO CON REFERENCIA Y SUGERENCIAS */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative"> 
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('navbar.search_placeholder', 'Buscar vehículos en venta o alquiler...')} // <-- AÑADIDO t()
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200" 
              />
            </form>

            {/* CAJA DESPLEGABLE DE RESULTADOS (NUEVO) */}
            {showSuggestions && searchTerm.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((v) => {
                      let parsedImages = [];
                      try { parsedImages = typeof v.images === 'string' ? JSON.parse(v.images) : (v.images || []); } catch(e) {}
                      const imageUrl = parsedImages.length > 0 ? parsedImages[0].image_url : null;
                      const isRent = v.is_rent === true || v.is_rent === 1 || v.is_rent === "1";

                      return (
                        <li key={v.id}>
                          <Link 
                            to={isRent ? `/alquiler/${v.id}` : `/advertisement/${v.id}`} 
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-4 p-3 hover:bg-zinc-700 transition border-b border-zinc-700/50 last:border-0"
                          >
                            <div className="h-10 w-14 rounded overflow-hidden bg-zinc-900 shrink-0">
                              {imageUrl ? (
                                <img src={imageUrl} alt="Coche" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-[8px] flex items-center justify-center h-full text-zinc-500 uppercase">Foto</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold truncate text-sm">{v.brand_name} {v.model_name}</p>
                              <p className="text-zinc-400 text-xs truncate">{v.province_name} • {v.year}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-red-500 font-bold text-sm">{Number(v.price).toLocaleString("es-ES")} €</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isRent ? 'bg-red-700 text-white' : 'bg-zinc-950 text-zinc-300'}`}>
                                {isRent ? 'Alquiler' : 'Venta'}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    <li className="bg-zinc-900 p-2 text-center">
                      <button onClick={handleSearch} className="text-sm font-bold text-zinc-300 hover:text-white transition">
                        {t('navbar.see_all', 'Ver todos los resultados')} {/* <-- AÑADIDO t() */}
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="p-4 text-center text-zinc-400 text-sm">No hay coincidencias para "{searchTerm}"</div>
                )}
              </div>
            )}
          </div>

          {/* Enlaces Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-zinc-300 hover:text-white transition-colors font-medium">{t('navbar.home', 'Inicio')}</Link>
            <Link to="/alquileres" className="text-zinc-300 hover:text-white transition-colors font-medium">{t('navbar.rents', 'Alquileres')}</Link>

            {!token ? (
              <div className="flex items-center gap-4 border-l border-zinc-700 pl-4">
                <Link to="/login" className="text-white hover:text-red-700 transition-colors font-medium">{t('navbar.login', 'Iniciar Sesión')}</Link>
                <Link to="/register" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">{t('navbar.register', 'Registrarse')}</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-zinc-700 pl-4">
                
                <Link to="/favoritos" className="text-zinc-300 hover:text-red-500 transition-colors font-medium flex items-center gap-2 mr-2">
                  <Heart size={18} />
                  {t('navbar.favorites', 'Favoritos')}
                </Link>

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
                        {t('navbar.hello', 'Hola')}, <span className="text-white font-semibold">{user.name?.split(" ")[0]}</span>
                      </span>
                      <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                      <Link to="/mis-anuncios" onClick={closeMenus} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                        <LayoutDashboard size={16} /> {t('navbar.my_ads', 'Mis Anuncios')}
                      </Link>
                      <Link to="/perfil" onClick={closeMenus} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                        <User size={16} /> {t('navbar.profile', 'Gestionar Perfil')}
                      </Link>
                      <hr className="my-2 border-zinc-800" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                        <LogOut size={16} /> {t('navbar.logout', 'Cerrar Sesión')}
                      </button>
                    </div>
                  )}
                </div>

                {userRole === 'admin' && (
                  <Link 
                    to="/admin/panel" 
                    className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all font-bold text-xs uppercase tracking-tighter shadow-lg shadow-red-900/20"
                  >
                    <ShieldAlert size={16} />
                    {t('navbar.admin_panel', 'Panel Moderación')}
                  </Link>
                )}
              </div>
            )}

            {/* <-- AÑADIDO: Selector de Idiomas Desktop MOVIDO A LA DERECHA DEL TODO --> */}
            <div className="flex items-center gap-2 border-l border-zinc-700 pl-4 ml-2">
              <button
                onClick={() => changeLanguage('es')}
                className={`transition-transform hover:scale-110 ${i18n.language?.startsWith('es') ? 'opacity-100' : 'opacity-50'}`}
                aria-label="Español"
              >
                <img src={esFlag} alt="Español" className="h-5 w-6 object-contain" />
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`transition-transform hover:scale-110 ${i18n.language?.startsWith('en') ? 'opacity-100' : 'opacity-50'}`}
                aria-label="English"
              >
                <img src={gbFlag} alt="English" className="h-5 w-6 object-contain" />
              </button>
            </div>

          </div>

          {/* Menú Móvil */}
          <div className="md:hidden flex items-center gap-4"> {/* <-- MODIFICADO PARA ALOJAR BANDERAS MÓVILES */}
            
            {/* <-- AÑADIDO: Selector de Idiomas Móvil --> */}
            <div className="flex items-center gap-2">
              <button onClick={() => changeLanguage('es')} className={`${i18n.language?.startsWith('es') ? 'opacity-100' : 'opacity-50'}`} aria-label="Español">
                <img src={esFlag} alt="Español" className="h-5 w-6 object-contain" />
              </button>
              <button onClick={() => changeLanguage('en')} className={`${i18n.language?.startsWith('en') ? 'opacity-100' : 'opacity-50'}`} aria-label="English">
                <img src={gbFlag} alt="English" className="h-5 w-6 object-contain" />
              </button>
            </div>

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

      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 shadow-xl pb-6">
          <div className="px-4 pt-4 space-y-2">
            <Link to="/" onClick={closeMenus} className="block px-2 py-2 text-zinc-300 font-medium hover:text-white">{t('navbar.home', 'Inicio')}</Link>
            <Link to="/alquileres" onClick={closeMenus} className="block px-2 py-2 text-zinc-300 font-medium hover:text-white">{t('navbar.rents', 'Alquileres')}</Link>
            
            {token && userRole === 'admin' && (
              <Link to="/admin/panel" onClick={closeMenus} className="flex items-center gap-2 px-2 py-2 text-red-500 font-bold">
                 <ShieldAlert size={18} /> {t('navbar.admin_panel', 'Panel Moderación')}
              </Link>
            )}
            
            <hr className="my-2 border-zinc-800" />
            
            {!token ? (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" onClick={closeMenus} className="block px-2 py-2 text-white font-medium hover:text-red-500">{t('navbar.login', 'Iniciar Sesión')}</Link>
                <Link to="/register" onClick={closeMenus} className="block px-2 py-2 text-red-500 font-medium">{t('navbar.register', 'Registrarse')}</Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <div className="px-2 py-2 text-zinc-400 text-sm">
                  {t('navbar.hello', 'Hola')}, <span className="text-white font-semibold">{user.name}</span>
                </div>
                
                <Link to="/favoritos" onClick={closeMenus} className="flex items-center gap-3 px-2 py-2 text-zinc-300 hover:text-white">
                  <Heart size={18} /> {t('navbar.favorites', 'Favoritos')}
                </Link>
                <Link to="/mis-anuncios" onClick={closeMenus} className="flex items-center gap-3 px-2 py-2 text-zinc-300 hover:text-white">
                  <LayoutDashboard size={18} /> {t('navbar.my_ads', 'Mis Anuncios')}
                </Link>
                <Link to="/perfil" onClick={closeMenus} className="flex items-center gap-3 px-2 py-2 text-zinc-300 hover:text-white">
                  <User size={18} /> {t('navbar.profile', 'Gestionar Perfil')}
                </Link>
                
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left mt-2">
                  <LogOut size={18} /> {t('navbar.logout', 'Cerrar Sesión')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}