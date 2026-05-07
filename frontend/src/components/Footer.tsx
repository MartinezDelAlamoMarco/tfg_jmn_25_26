import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "../config";
import logo from "../assets/Logotipo.png";
import { Mail, Phone, MapPin, Car } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  // Obtenemos el token para verificar si el usuario está autenticado 
  const token = localStorage.getItem("auth_token");

  return (
    <footer className="w-full bg-zinc-900 text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Columna 1: Logo y Descripción */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt={`Logo de ${APP_NAME}`} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t('footer.description', 'Tu plataforma inteligente para la gestión y análisis del mercado automovilístico. Compra, vende y alquila con total confianza.')}
            </p>
          </div>

          {/* Columna 2: Navegación con Redirección Condicional */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">{t('footer.nav_title', 'Explorar')}</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('navbar.home', 'Inicio')}</Link></li>
              <li><Link to="/alquileres" className="hover:text-white transition-colors">{t('navbar.rents', 'Alquileres')}</Link></li>
              
              {/* Si no hay token, redirige a Login  */}
              <li>
                <Link 
                  to={token ? "/favoritos" : "/login"} 
                  className="hover:text-white transition-colors"
                >
                  {t('navbar.favorites', 'Favoritos')}
                </Link>
              </li>
              <li>
                <Link 
                  to={token ? "/perfil" : "/login"} 
                  className="hover:text-white transition-colors"
                >
                  {t('navbar.profile', 'Mi Perfil')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">{t('footer.legal_title', 'Legal')}</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/aviso-legal" className="hover:text-white transition-colors">{t('footer.legal_notice', 'Aviso Legal')}</Link></li>
              <li><Link to="/politica-privacidad" className="hover:text-white transition-colors">{t('footer.privacy_policy', 'Política de Privacidad')}</Link></li>
              <li><Link to="/politica-cookies" className="hover:text-white transition-colors">{t('footer.cookies_policy', 'Política de Cookies')}</Link></li>
              <li><Link to="/terminos-condiciones" className="hover:text-white transition-colors">{t('footer.terms', 'Términos y Condiciones')}</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">{t('footer.contact_title', 'Contacto')}</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-red-500 shrink-0" />
                <span>Rivas-Vaciamadrid, Madrid, España</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-red-500 shrink-0" />
                <span>+34 900 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-red-500 shrink-0" />
                <a href="mailto:info@redlinemotors.com" className="hover:text-white transition-colors">info@redlinemotors.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Barra inferior de Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Car size={14} className="text-zinc-600" />
            <span>© {currentYear} {APP_NAME}. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-4">
             <span className="hover:text-zinc-300 transition-colors cursor-default italic">TFG 2º DAW</span>
          </div>
        </div>
      </div>
    </footer>
  );
}