import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { APP_NAME, API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from "../config"; 
import logo from "../assets/Logotipo.png";
import esFlag from "../assets/flag-es.svg";
import gbFlag from "../assets/flag-gb.svg";
import { ChevronDown, User, LayoutDashboard, LogOut, Heart, ShieldAlert, MessageSquare, Sun, Moon, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createClient } from '@supabase/supabase-js'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = localStorage.getItem("user_role");

  const [allAds, setAllAds] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false); 
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [isLight, setIsLight] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "light";
    }
    return document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  const toggleTheme = () => setIsLight(!isLight);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/advertisements`)
      .then(res => setAllAds(res.data))
      .catch(err => console.error("Error cargando anuncios", err));
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const total = res.data.reduce((sum: number, chat: any) => sum + (chat.unread_count || 0), 0);
        setTotalUnread(total);
      } catch (error) {
        console.error("Error al obtener notificaciones", error);
      }
    };

    fetchUnreadCount();

    const notificationsChannel = supabase
      .channel('global-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(notificationsChannel); };
  }, [token]);

  useEffect(() => {
    setSearchTerm("");
    setShowSuggestions(false);
    setShowSearchInput(false); 
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
      setShowSearchInput(false);
    }
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        if (searchTerm.trim() === "") {
          setShowSearchInput(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    
    return allAds.filter(ad => {
      const searchString = `${ad.brand_name} ${ad.model_name} ${ad.province_name} ${ad.year}`.toLowerCase();
      return searchString.includes(query);
    }).slice(0, 5); 
  }, [searchTerm, allAds]);

  return (
    <nav className="w-full bg-zinc-900 text-white border-b border-zinc-800 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* ESTRUCTURA PRINCIPAL: 3 PARTES (Izquierda, Centro, Derecha) */}
        <div className="flex justify-between items-center h-16">
          
          {/* 1. IZQUIERDA: Logo */}
          <div className="shrink-0 flex items-center mr-4">
            <Link to="/" onClick={closeMenus} className="flex items-center gap-2">
              <img src={logo} alt={`Logo de ${APP_NAME}`} className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* 2. CENTRO: Buscador (flex-1 para empujar a los lados, justificado al centro en escritorio) */}
          <div className="flex-1 flex justify-end lg:justify-center px-2 lg:px-6 min-w-0 z-50" ref={searchRef}>
            <div className="relative flex justify-end lg:justify-center w-full lg:max-w-md xl:max-w-lg">
              
              {/* Formulario Desktop (Siempre visible) & Mobile (Absoluto al hacer clic) */}
              <form 
                onSubmit={handleSearch} 
                className={`items-center bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden animate-in fade-in zoom-in duration-200 ${showSearchInput ? 'flex absolute right-0 top-1/2 -translate-y-1/2 w-[calc(100vw-5rem)] sm:w-80 z-50' : 'hidden lg:flex w-full'}`}
              >
                <div className="pl-3 text-zinc-400 flex items-center pointer-events-none shrink-0">
                  <Search size={18} />
                </div>
                <input 
                  autoFocus={showSearchInput}
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t('navbar.search_placeholder', 'Buscar vehículos...')} 
                  className="w-full px-3 py-2 bg-transparent text-white focus:outline-none text-sm min-w-0" 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchTerm("");
                  }} 
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors lg:hidden shrink-0"
                >
                  <X size={18} />
                </button>
              </form>

              {/* Botón Lupa en Móviles (solo si el input está oculto) */}
              {!showSearchInput && (
                <button 
                  onClick={() => setShowSearchInput(true)} 
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors lg:hidden shrink-0"
                  aria-label="Abrir buscador"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Sugerencias de Búsqueda */}
              {showSuggestions && searchTerm.trim() !== "" && (
                <div className={`absolute top-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-60 ${showSearchInput ? 'right-0 w-[calc(100vw-5rem)] sm:w-80' : 'hidden lg:block left-0 w-full'}`}>
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
                              onClick={() => {
                                setShowSuggestions(false);
                                setShowSearchInput(false);
                              }}
                              className="flex items-center gap-4 p-3 hover:bg-zinc-700 transition border-b border-zinc-700/50 last:border-0"
                            >
                              <div className="h-10 w-14 rounded overflow-hidden bg-zinc-900 shrink-0">
                                {imageUrl ? (
                                  <img src={imageUrl} alt={t('create_ad.photo', "Foto")} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-[8px] flex items-center justify-center h-full text-zinc-500 uppercase">{t('common.photo', 'Foto')}</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold truncate text-sm">{v.brand_name} {v.model_name}</p>
                                <p className="text-zinc-400 text-xs truncate">{v.province_name} • {v.year}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-red-500 font-bold text-sm">
                                  {Number(v.price).toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'es-ES')} €
                                </p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isRent ? 'bg-red-700 text-white' : 'bg-zinc-950 text-zinc-300'}`}>
                                  {isRent ? t('common.rent', 'Alquiler') : t('common.sale', 'Venta')}
                                </span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                      <li className="bg-zinc-900 p-2 text-center">
                        <button onClick={handleSearch} className="text-sm font-bold text-zinc-300 hover:text-white transition">
                          {t('navbar.see_all', 'Ver todos los resultados')}
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-zinc-400 text-sm">
                      {t('navbar.no_matches', 'No hay coincidencias para')} "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. DERECHA: Menús, Perfil y Configuración */}
          <div className="shrink-0 flex items-center gap-2 lg:gap-4 xl:gap-6">
            
            {/* Menú Escritorio (Enlaces, Auth y Perfil) */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/" className={`relative transition-all duration-300 ${location.pathname === '/' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-red-500 font-medium'} after:absolute after:-bottom-1 after:left-0 after:h-2px after:w-full after:bg-red-500 after:transition-transform after:duration-300 after:origin-center ${location.pathname === '/' ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                {t('navbar.home', 'Compras')}
              </Link>
              
              <Link to="/alquileres" className={`relative transition-all duration-300 ${location.pathname === '/alquileres' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-red-500 font-medium'} after:absolute after:-bottom-1 after:left-0 after:h-2px after:w-full after:bg-red-500 after:transition-transform after:duration-300 after:origin-center ${location.pathname === '/alquileres' ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                {t('navbar.rents', 'Alquileres')}
              </Link>

              {!token ? (
                <div className="flex items-center gap-4 border-l border-zinc-700 pl-4">
                  <Link to="/login" className={`relative transition-all duration-300 ${location.pathname === '/login' ? 'text-red-700 font-bold' : 'text-white hover:text-red-700 font-medium'} after:absolute after:-bottom-1 after:left-0 after:h-2px after:w-full after:bg-red-700 after:transition-transform after:duration-300 after:origin-center ${location.pathname === '/login' ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                    {t('navbar.login', 'Iniciar Sesión')}
                  </Link>
                  <Link to="/register" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">{t('navbar.register', 'Registrarse')}</Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 xl:gap-4 border-l border-zinc-700 pl-4">
                  <Link to="/favoritos" className={`relative flex items-center gap-1 xl:gap-2 transition-all duration-300 ${location.pathname === '/favoritos' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-red-500 font-medium'} after:absolute after:-bottom-1 after:left-0 after:h-2px after:w-full after:bg-red-500 after:transition-transform after:duration-300 after:origin-center ${location.pathname === '/favoritos' ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                    <Heart size={18} fill={location.pathname === '/favoritos' ? 'currentColor' : 'none'} />
                    <span className="hidden xl:inline">{t('navbar.favorites', 'Favoritos')}</span>
                  </Link>

                  <Link to="/mis-mensajes" className={`relative flex items-center gap-1 xl:gap-2 transition-all duration-300 ${location.pathname === '/mis-mensajes' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-red-500 font-medium'} after:absolute after:-bottom-1 after:left-0 after:h-2px after:w-full after:bg-red-500 after:transition-transform after:duration-300 after:origin-center ${location.pathname === '/mis-mensajes' ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                    <MessageSquare size={18} fill={location.pathname === '/mis-mensajes' ? 'currentColor' : 'none'} />
                    <span className="hidden xl:inline">{t('navbar.messages', 'Mensajes')}</span>
                    {totalUnread > 0 && (
                      <span className="absolute -top-2 -right-2 xl:-right-3 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-lg shadow-red-900/50 animate-bounce">
                        {totalUnread}
                      </span>
                    )}
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-2 xl:gap-3 pl-3 xl:pl-4 border-l border-zinc-700 group focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 font-bold group-hover:border-red-500 transition-colors shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-300 text-sm group-hover:text-white transition-colors truncate max-w-80px">
                          {t('navbar.hello', 'Hola')}, <span className="text-white font-semibold">{user.name?.split(" ")[0]}</span>
                        </span>
                        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 shrink-0 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                        <Link to={`/usuario/${user.id}`} state={{ from: location.pathname + location.search }} onClick={closeMenus} className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${location.pathname === `/usuario/${user.id}` ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}>
                          <User size={16} className="text-red-500" /> {t('navbar.public_profile', 'Mi Perfil Público')}
                        </Link>
                        <Link to="/mis-anuncios" onClick={closeMenus} className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${location.pathname === '/mis-anuncios' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}>
                          <LayoutDashboard size={16} /> {t('navbar.my_ads', 'Mis Anuncios')}
                        </Link>
                        <Link to="/perfil" onClick={closeMenus} className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${location.pathname === '/perfil' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}>
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
                      className="flex items-center gap-1 xl:gap-2 bg-red-700 hover:bg-red-600 text-white px-2 xl:px-3 py-1.5 rounded-lg transition-all font-bold text-[10px] xl:text-xs uppercase tracking-tighter shadow-lg shadow-red-900/20 ml-2 whitespace-nowrap shrink-0"
                    >
                      <ShieldAlert size={14} className="xl:w-4 xl:h-4" />
                      <span className="hidden xl:inline">{t('navbar.admin_panel', 'Panel Moderación')}</span>
                      <span className="xl:hidden">Admin</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Preferencias Escritorio (Banderas y Tema) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 border-l border-zinc-700 pl-3 xl:pl-4">
              <button
                onClick={toggleTheme}
                className="p-1.5 xl:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Cambiar tema"
              >
                {isLight ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <div className="flex items-center gap-1.5 xl:gap-2">
                <button
                  onClick={() => changeLanguage('es')}
                  className={`transition-transform hover:scale-110 shrink-0 ${i18n.language?.startsWith('es') ? 'opacity-100' : 'opacity-50'}`}
                  aria-label="Español"
                >
                  <img src={esFlag} alt="Español" className="h-4 w-5 xl:h-5 xl:w-6 object-contain" />
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`transition-transform hover:scale-110 shrink-0 ${i18n.language?.startsWith('en') ? 'opacity-100' : 'opacity-50'}`}
                  aria-label="English"
                >
                  <img src={gbFlag} alt="English" className="h-4 w-5 xl:h-5 xl:w-6 object-contain" />
                </button>
              </div>
            </div>

            {/* Botón Menú Móvil (Hamburguesa) */}
            <div className="lg:hidden flex items-center shrink-0"> 
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-white hover:text-red-700 p-2"
                aria-label="Abrir menú"
              >
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
      </div>

      {/* Menú Desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 shadow-xl pb-6 animate-in slide-in-from-top-2">
          <div className="px-4 pt-4 space-y-2">
            
            {/* BLOQUE: Preferencias (Tema e Idioma) */}
            <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => changeLanguage('es')} 
                  className={`transition-all ${i18n.language?.startsWith('es') ? 'opacity-100 scale-110 drop-shadow-md' : 'opacity-50 grayscale hover:grayscale-0'}`} 
                  aria-label="Español"
                >
                  <img src={esFlag} alt="Español" className="h-5 w-6 object-contain" />
                </button>
                <button 
                  onClick={() => changeLanguage('en')} 
                  className={`transition-all ${i18n.language?.startsWith('en') ? 'opacity-100 scale-110 drop-shadow-md' : 'opacity-50 grayscale hover:grayscale-0'}`} 
                  aria-label="English"
                >
                  <img src={gbFlag} alt="English" className="h-5 w-6 object-contain" />
                </button>
              </div>
              <div className="border-l border-zinc-700 pl-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Cambiar tema"
                >
                  {isLight ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
            </div>
            
            <hr className="my-2 border-zinc-800" />

            <Link to="/" onClick={closeMenus} className={`block px-2 py-2 transition-all ${location.pathname === '/' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 font-medium hover:text-white'}`}>{t('navbar.home', 'Inicio')}</Link>
            <Link to="/alquileres" onClick={closeMenus} className={`block px-2 py-2 transition-all ${location.pathname === '/alquileres' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 font-medium hover:text-white'}`}>{t('navbar.rents', 'Alquileres')}</Link>
            
            {token && userRole === 'admin' && (
              <Link to="/admin/panel" onClick={closeMenus} className="flex items-center gap-2 px-2 py-2 text-red-500 font-bold">
                 <ShieldAlert size={18} /> {t('navbar.admin_panel', 'Panel Moderación')}
              </Link>
            )}
            
            <hr className="my-2 border-zinc-800" />
            
            {!token ? (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" onClick={closeMenus} className={`block px-2 py-2 transition-all ${location.pathname === '/login' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-white font-medium hover:text-red-500'}`}>{t('navbar.login', 'Iniciar Sesión')}</Link>
                <Link to="/register" onClick={closeMenus} className={`block px-2 py-2 transition-all ${location.pathname === '/register' ? 'text-red-400 font-bold underline decoration-red-400 decoration-2 underline-offset-4' : 'text-red-500 font-medium'}`}>{t('navbar.register', 'Registrarse')}</Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <div className="px-2 py-2 text-zinc-400 text-sm">
                  {t('navbar.hello', 'Hola')}, <span className="text-white font-semibold">{user.name}</span>
                </div>
                
                <Link to={`/usuario/${user.id}`} state={{ from: location.pathname + location.search }} onClick={closeMenus} className={`flex items-center gap-3 px-2 py-2 transition-all ${location.pathname === `/usuario/${user.id}` ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 hover:text-white'}`}>
                  <User size={18} className="text-red-500" /> {t('navbar.public_profile', 'Mi Perfil Público')}
                </Link>

                <Link to="/favoritos" onClick={closeMenus} className={`flex items-center gap-3 px-2 py-2 transition-all ${location.pathname === '/favoritos' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 hover:text-white'}`}>
                  <Heart size={18} /> {t('navbar.favorites', 'Favoritos')}
                </Link>
                
                <Link to="/mis-mensajes" onClick={closeMenus} className={`flex items-center justify-between px-2 py-2 transition-all ${location.pathname === '/mis-mensajes' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 hover:text-white'}`}>
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} /> {t('navbar.messages', 'Mensajes')}
                  </div>
                  {totalUnread > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg shadow-red-900/50">
                      {totalUnread}
                    </span>
                  )}
                </Link>

                <Link to="/mis-anuncios" onClick={closeMenus} className={`flex items-center gap-3 px-2 py-2 transition-all ${location.pathname === '/mis-anuncios' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 hover:text-white'}`}>
                  <LayoutDashboard size={18} /> {t('navbar.my_ads', 'Mis Anuncios')}
                </Link>
                <Link to="/perfil" onClick={closeMenus} className={`flex items-center gap-3 px-2 py-2 transition-all ${location.pathname === '/perfil' ? 'text-white font-bold underline decoration-white decoration-2 underline-offset-4' : 'text-zinc-300 hover:text-white'}`}>
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