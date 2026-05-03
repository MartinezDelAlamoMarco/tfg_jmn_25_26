import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

interface Advertisement {
  id: number;
  price: string;
  description: string;
  description_en?: string;
  views: number;
  state?: { name: string };
  province?: { name: string };
  images: { image_url: string; is_main: boolean }[];
  vehicle?: {
    km: number;
    year: number;
    power_hp: number;
    doors: number;
    fuel_type?: { name: string };
    transmission?: { name: string };
    tonality?: { name: string };
    model?: {
      name: string;
      brand?: { name: string };
    };
  };
}

const RentDetail = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith("en");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false); 
  const [mainImage, setMainImage] = useState<string>("");

  const [dates, setDates] = useState({ start: "", end: "" });
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const today = new Date().toISOString().split("T")[0];
  const userRole = localStorage.getItem('user_role');
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);
        
        const img = response.data.images?.find((i: any) => i.is_main)?.image_url 
                 || response.data.images?.[0]?.image_url;
        setMainImage(img || "");
        
        setTotalPrice(Number(response.data.price));
      } catch (err) {
        console.error("Error al cargar el vehículo:", err);
        setError(t('edit_ad.error_loading', "No se pudo cargar la información del vehículo."));
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, t]);

  useEffect(() => {
    if (dates.start && dates.end && advertisement) {
      const start = new Date(dates.start);
      const end = new Date(dates.end);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setTotalPrice(diffDays * Number(advertisement.price));
      } else {
        setTotalPrice(Number(advertisement.price));
      }
    } else if (advertisement) {
      setTotalPrice(Number(advertisement.price));
    }
  }, [dates, advertisement]);

  const handleRent = async () => {
    if (!token) {
        alert(t('details.login_required_rent', "Debes iniciar sesión para realizar una reserva."));
        navigate("/login");
        return;
    }

    if (!dates.start || !dates.end) {
      setError(t('details.select_dates', "Por favor, selecciona las fechas de inicio y fin."));
      return;
    }
    
    setError(null);
    setActionLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/rents`, {
        advertisement_id: advertisement?.id,
        start_date: dates.start,
        end_date: dates.end
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true); 
    } catch (err: any) {
      console.error("Error al reservar", err);
      setError(err.response?.data?.message || t('details.booking_error', "Error al procesar la reserva. Verifica tu sesión."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (window.confirm(t('my_ads.delete_confirm', "⚠️ ¿Estás seguro de que quieres ELIMINAR este anuncio definitivamente por incumplir las normas?"))) {
      try {
        await axios.delete(`${API_BASE_URL}/advertisements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(t('common.delete_success', "Anuncio de alquiler eliminado correctamente."));
        navigate('/admin/panel');
      } catch (error) {
        console.error("Error eliminando el anuncio", error);
        alert(t('common.delete_error', "Hubo un error al eliminar el anuncio."));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (error || !advertisement) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white bg-zinc-950">
        <p className="text-xl mb-4 text-zinc-500 italic">{error || t('common.not_found', "Vehículo no encontrado")}</p>
        <button onClick={() => navigate(-1)} className="text-red-700 font-bold hover:underline">{t('details.go_back', "Volver atrás")}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative pt-24">
      {actionLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mb-4"></div>
            <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse">{t('details.processing_booking', "Procesando reserva...")}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/alquileres')}
          className="flex items-center text-zinc-400 hover:text-white mb-8 transition duration-200 uppercase font-bold text-xs tracking-widest"
        >
          <span className="mr-2">←</span> {t('details.back_to_fleet', "Volver a la flota")}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center shadow-2xl overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-widest">
                {t('common.rent', "Alquiler")}
              </div>
              {mainImage ? (
                <img
                  src={mainImage}
                  alt="Coche principal"
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <span className="text-zinc-500 italic text-lg">{t('common.no_photo', "Sin imagen disponible")}</span>
              )}
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {advertisement.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img.image_url)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition ${
                    mainImage === img.image_url ? 'border-red-600' : 'border-zinc-700 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  {advertisement.state?.name || t('common.available', "Disponible")}
                </span>
                <span className="text-zinc-500 text-sm">
                  {t('details.views', "Vistas:")} {advertisement.views || 0}
                </span>
              </div>

              <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
                {advertisement.vehicle?.model?.brand?.name} {advertisement.vehicle?.model?.name}
              </h1>
              <p className="text-zinc-400 text-lg mb-6 flex items-center">
                <span className="mr-2">📍</span> {advertisement.province?.name || t('common.spain', "España")}
              </p>

              <div className="flex items-end mb-8 gap-2">
                <div className="text-5xl font-black text-white">
                  {Number(advertisement.price).toLocaleString("es-ES")}{" "}
                  <span className="text-red-700">€</span>
                </div>
                <span className="text-zinc-500 font-bold uppercase italic pb-1">{t('common.per_day', "/ día")}</span>
              </div>

              {userRole === 'admin' ? (
                <div className="mt-8 bg-red-950/30 p-6 rounded-xl border border-red-900 mb-8 text-center">
                  <h3 className="text-red-500 font-bold uppercase text-sm tracking-widest mb-4">{t('details.mod_tools', "🛠️ Herramientas de Moderador")}</h3>
                  <button 
                    onClick={handleDeleteAd}
                    className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-lg shadow-red-900/20"
                  >
                    {t('common.delete_ad', "Eliminar Anuncio")}
                  </button>
                </div>
              ) : (
                <>
                  {success ? (
                    <div className="bg-green-900/20 border border-green-700 p-8 rounded-2xl text-center mb-8 animate-fade-in">
                      <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                      <h3 className="text-xl font-bold text-green-500 mb-2">{t('details.booking_success', "¡Reserva Confirmada!")}</h3>
                      <p className="text-zinc-400 text-sm">{t('details.booking_contact', "El propietario se pondrá en contacto contigo pronto.")}</p>
                      <button onClick={() => navigate('/mis-reservas')} className="mt-6 px-6 py-2 bg-zinc-900 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-sm font-bold uppercase transition">{t('details.view_my_bookings', "Ver mis reservas")}</button>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-700 mb-8">
                      <h3 className="text-lg font-bold uppercase italic border-b border-zinc-700 pb-3 mb-4">{t('details.booking_dates', "Fechas de reserva")}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">{t('details.pickup', "Recogida")}</label>
                          <input 
                            type="date" 
                            min={today}
                            value={dates.start} 
                            onChange={(e) => setDates({...dates, start: e.target.value})}
                            className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-3 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition" 
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">{t('details.dropoff', "Devolución")}</label>
                          <input 
                            type="date" 
                            min={dates.start || today}
                            value={dates.end} 
                            onChange={(e) => setDates({...dates, end: e.target.value})}
                            className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-3 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition" 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
                        <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">{t('details.estimated_total', "Total Estimado")}</span>
                        <span className="text-2xl font-black text-red-500">{totalPrice.toLocaleString("es-ES")} €</span>
                      </div>

                      {error && <p className="text-red-500 text-sm font-bold mt-4 text-center">{error}</p>}
                    </div>
                  )}

                  {!success && (
                    <div className="mb-6">
                      {token ? (
                        <button 
                          onClick={handleRent}
                          className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-lg shadow-red-900/20 active:scale-95 mb-4"
                        >
                          {t('details.confirm_booking', "Confirmar Reserva")}
                        </button>
                      ) : (
                        <Link 
                          to="/login"
                          className="block w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white text-center font-black uppercase tracking-widest rounded-xl transition duration-300 mb-4"
                        >
                          {t('details.login_to_book', "Inicia sesión para reservar")}
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-700/50 flex justify-end">
                    {token ? (
                        <Link
                            to={`/anuncios/${advertisement.id}/reportar`}
                            className="text-zinc-500 hover:text-red-500 text-xs font-bold uppercase flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {t('details.report_ad', "Denunciar este anuncio")}
                        </Link>
                    ) : (
                        <span className="text-zinc-600 text-[10px] uppercase font-black italic">{t('details.login_to_report', "Inicia sesión para denunciar")}</span>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">{t('details.description', "Descripción")}</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">{isEnglish && advertisement.description_en ? advertisement.description_en : advertisement.description}</p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">{t('details.tech_sheet', "Ficha Técnica")}</h2>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">{t('details.engine', "Motor")}</span>
                <span className="font-semibold">{advertisement.vehicle?.fuel_type?.name || "N/A"} - {advertisement.vehicle?.power_hp || 0} CV</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">{t('common.transmission', "Transmisión")}</span>
                <span className="font-semibold">{advertisement.vehicle?.transmission?.name || t('common.manual', "Manual")}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">{t('common.year', "Año")}</span>
                <span className="font-semibold">{advertisement.vehicle?.year || "-"}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">{t('common.doors', "Puertas")}</span>
                <span className="font-semibold">{advertisement.vehicle?.doors || "5"}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">{t('common.color', "Color")}</span>
                <span className="font-semibold">{advertisement.vehicle?.tonality?.name || "N/A"}</span>
              </li>
              <li className="flex justify-between items-center pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">{t('common.location', "Ubicación")}</span>
                <span className="font-semibold">{advertisement.province?.name || "N/A"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentDetail;