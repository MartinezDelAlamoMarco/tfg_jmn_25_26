import { useTranslation } from "react-i18next"; // <-- IMPRESCINDIBLE

const LoadingScreen = ({ message }: { message?: string }) => {
  const { t } = useTranslation(); // <-- IMPRESCINDIBLE
  
  // Si no le pasan mensaje, usa "Cargando..." traducido
  const displayMessage = message || t('common.loading', "Cargando...");

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white">
      {/* El Spinner con los colores de tu marca */}
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
      
      {/* El texto con estilo Redline */}
      <p className="font-black italic uppercase tracking-[0.2em] text-zinc-500 animate-pulse text-sm">
        {displayMessage}
      </p>
    </div>
  );
};

export default LoadingScreen;