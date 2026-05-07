import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Comprobamos si ya existe la preferencia guardada en el navegador
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Si no existe, mostramos el banner
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setIsVisible(false);
  };

  // Si ya ha contestado o cerrado el banner, no renderizamos nada
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 bg-zinc-900 border-t border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 sm:p-6 animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Icono y Texto */}
        <div className="flex items-start gap-4 flex-1">
          <Cookie className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-white font-bold mb-1">{t('cookie_banner.title', 'Valoramos tu privacidad')}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t('cookie_banner.message', 'Utilizamos cookies propias y de terceros para gestionar la sesión, analizar la navegación y mejorar la experiencia en nuestra plataforma. Al hacer clic en "Aceptar todas", consientes su uso.')}
              {" "}
              <Link to="/politica-cookies" className="text-red-500 hover:text-red-400 underline underline-offset-2 transition-colors whitespace-nowrap">
                {t('cookie_banner.read_more', 'Leer Política')}
              </Link>
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={handleReject}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
          >
            {t('cookie_banner.reject', 'Rechazar')}
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-900/20"
          >
            {t('cookie_banner.accept', 'Aceptar todas')}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="hidden sm:flex p-2 text-zinc-500 hover:text-white transition-colors ml-2"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        
      </div>
    </div>
  );
}