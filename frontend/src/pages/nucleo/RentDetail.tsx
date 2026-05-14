import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";
import { MessageCircle, Calendar as CalendarIcon, Info, AlertCircle, ChevronLeft, Flag } from "lucide-react"; // <-- AÑADIDO Flag
import StarRating from "../../components/StarRating";

// --- IMPORTS DEL CALENDARIO ---
import { DayPicker, type DateRange } from "react-day-picker";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface Advertisement {
  id: number;
  price: string;
  description: string;
  description_en?: string;
  views: number;
  status: string; 
  state?: { name: string };
  province?: { name: string };
  images: { image_url: string; is_main: boolean }[];
  vehicle?: {
    owner_id: number;
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
  const location = useLocation();

  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false); 
  const [mainImage, setMainImage] = useState<string>("");
  const [bookedDates, setBookedDates] = useState<{start_date: string, end_date: string}[]>([]);

  const [contactLoading, setContactLoading] = useState<boolean>(false);

  const [range, setRange] = useState<DateRange | undefined>();
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [ownerDetails, setOwnerDetails] = useState<any>(null);

  const token = localStorage.getItem("auth_token");
  const userRole = localStorage.getItem('user_role');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem('user_id');
    if (!storedId) {
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try { storedId = JSON.parse(storedUserStr).id; } catch(e) {}
      }
    }
    if (storedId) setCurrentUserId(String(storedId));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [adRes, bookedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/vehicles/${id}`),
          axios.get(`${API_BASE_URL}/advertisements/${id}/booked-dates`)
        ]);

        setAdvertisement(adRes.data);
        setBookedDates(bookedRes.data || []);
        setTotalPrice(Number(adRes.data.price));

        const img = adRes.data.images?.find((i: any) => i.is_main)?.image_url 
                  || adRes.data.images?.[0]?.image_url;
        setMainImage(img || "");

        const oId = adRes.data.vehicle?.owner_id || adRes.data.user_id;
        if (oId) {
          const userRes = await axios.get(`${API_BASE_URL}/users/${oId}`);
          setOwnerDetails(userRes.data);
        }
      } catch (err) {
        setError(t('details.error_loading_info', "Error al cargar la información."));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  useEffect(() => {
    if (range?.from && range?.to && advertisement) {
      const days = differenceInDays(range.to, range.from) + 1;
      setTotalPrice(days * Number(advertisement.price));
      setError(null);
    } else if (advertisement) {
      setTotalPrice(Number(advertisement.price));
    }
  }, [range, advertisement]);

  const ownerId = advertisement?.vehicle?.owner_id || (advertisement as any)?.user_id;
  const isOwner = currentUserId !== null && ownerId !== undefined && String(currentUserId) === String(ownerId);

  const disabledDays = [
    { from: new Date(1900, 0, 1), to: addDays(new Date(), -1) },
    ...bookedDates.map(b => ({ from: new Date(b.start_date), to: new Date(b.end_date) }))
  ];

  const handleContactSeller = async () => {
    if (!token) { navigate('/login'); return; }
    if (!advertisement || !ownerId) return;

    setContactLoading(true); 

    try {
      await axios.post(`${API_BASE_URL}/conversations`, { 
        advertisement_id: advertisement.id, 
        seller_id: ownerId 
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/mis-mensajes');
    } catch (err) { 
      alert(t('details.chat_error', "No se pudo iniciar la conversación.")); 
    } finally {
      setContactLoading(false); 
    }
  };

  const handleDeleteAd = async () => {
    if (window.confirm(t('my_ads.delete_confirm', "⚠️ ¿Estás seguro de que quieres ELIMINAR este anuncio definitivamente?"))) {
      try {
        await axios.delete(`${API_BASE_URL}/advertisements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(t('common.delete_success', "Anuncio eliminado correctamente."));
        navigate('/admin/panel');
      } catch (error) { alert(t('common.delete_error', "Hubo un error al eliminar el anuncio.")); }
    }
  };

  const handleRent = async () => {
    if (!token) { navigate("/login"); return; }
    if (!range?.from || !range?.to) { setError(t('details.select_range_error', "Selecciona un rango en el calendario.")); return; }
    
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/rents`, {
        advertisement_id: id,
        start_date: format(range.from, "yyyy-MM-dd"),
        end_date: format(range.to, "yyyy-MM-dd")
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (ownerId) {
        await axios.post(`${API_BASE_URL}/conversations`, {
          advertisement_id: id,
          seller_id: ownerId
        }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('details.booking_error', "Error al reservar"));
    } finally { setActionLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-red-700 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative pt-24 font-sans">
      
      {actionLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mb-4"></div>
          <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse">{t('details.processing_booking', "Procesando reserva...")}</p>
        </div>
      )}

      {contactLoading && (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
          <p className="font-black italic uppercase tracking-[0.2em] text-red-500 animate-pulse text-sm text-center px-4">
            {t('details.starting_chat', 'Iniciando chat...')}
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-zinc-400 hover:text-white mb-8 transition duration-200 uppercase font-bold text-xs tracking-widest">
          <ChevronLeft size={20} className="mr-1" /> {t('details.go_back', "Volver atrás")}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center shadow-2xl overflow-hidden relative">
              {advertisement?.status === 'vendido' && <div className="absolute top-4 left-4 z-10 bg-zinc-700 text-zinc-300 text-[10px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-widest border border-zinc-500">🏁 {t('common.rented', "Alquilado")}</div>}
              <div className="absolute top-4 right-4 z-10 bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-widest">{t('common.rent', "Alquiler")}</div>
              {mainImage ? <img src={mainImage} alt="Coche" className="w-full h-full object-cover animate-fade-in" /> : <span className="text-zinc-500 italic text-lg">{t('common.no_photo', "Sin imagen")}</span>}
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {advertisement?.images?.map((img, i) => (
                <button key={i} onClick={() => setMainImage(img.image_url)} className={`aspect-square rounded-lg border-2 overflow-hidden transition ${mainImage === img.image_url ? 'border-red-600' : 'border-zinc-700 opacity-50 hover:opacity-100'}`}><img src={img.image_url} className="w-full h-full object-cover" /></button>
              ))}
            </div>

            {ownerDetails && (
              <Link to={`/usuario/${ownerId}`} state={{ from: location.pathname + location.search }} className="mt-4 block bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-all shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center text-xl font-bold uppercase overflow-hidden">
                    {ownerDetails.avatar_url ? <img src={ownerDetails.avatar_url} className="w-full h-full object-cover" /> : <span>{ownerDetails.name ? ownerDetails.name[0] : 'U'}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{ownerDetails.name || t('details.seller_fallback', "Vendedor")}</div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                      <StarRating value={Math.round(ownerDetails.average_rating || 0)} size={16} />
                      <span className="text-white font-bold">{Number(ownerDetails.average_rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="flex flex-col">
            <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">{advertisement?.state?.name || t('common.rent', "Alquiler")}</span>
                <span className="text-zinc-500 text-sm">{t('details.views', "Vistas")}: {advertisement?.views || 0}</span>
              </div>
              <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">{advertisement?.vehicle?.model?.brand?.name} {advertisement?.vehicle?.model?.name}</h1>
              <p className="text-zinc-400 text-lg mb-6 flex items-center"><span className="mr-2">📍</span> {advertisement?.province?.name || t('common.spain', "España")}</p>
              <div className="flex items-end mb-8 gap-2"><div className="text-5xl font-black text-white">{Number(advertisement?.price).toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'es-ES')} €</div><span className="text-zinc-500 font-bold uppercase italic pb-1">{t('common.per_day', "/ día")}</span></div>

              {userRole === 'admin' ? (
                  <div className="mt-4 bg-red-950/30 p-6 rounded-xl border border-red-900 mb-8 text-center">
                    <h3 className="text-red-500 font-bold uppercase text-sm tracking-widest mb-4">{t('details.mod_tools', "🛠️ Herramientas de Moderador")}</h3>
                    <button onClick={handleDeleteAd} className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition shadow-lg">{t('common.delete_ad', "Eliminar Anuncio")}</button>
                  </div>
              ) : (
                <>
                  {success ? (
                    <div className="bg-green-900/20 border border-green-700 p-8 rounded-2xl text-center mb-8 animate-fade-in">
                      <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                      <h3 className="text-xl font-bold text-green-500 mb-2">{t('details.booking_success', "¡Reserva Confirmada!")}</h3>
                      <button onClick={() => navigate('/mis-mensajes')} className="mt-6 px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-bold uppercase transition flex items-center justify-center gap-2 mx-auto shadow-lg"><MessageCircle size={18} /> {t('details.go_to_chat', "Ir al chat ahora")}</button>
                    </div>
                  ) : (
                    <>
                      {/* CALENDARIO VISUAL ESTILO BOOKING */}
                      <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-700 mb-8 flex flex-col items-center">
                        <h3 className="text-xs font-black uppercase text-zinc-500 mb-4 self-start flex items-center gap-2 tracking-widest ml-2"><CalendarIcon size={16}/> {t('details.availability', "Disponibilidad")}</h3>
                        <DayPicker
                          mode="range"
                          selected={range}
                          onSelect={setRange}
                          disabled={disabledDays}
                          locale={es}
                          className="custom-rdp"
                        />
                        {range?.from && range?.to && (
                          <div className="mt-4 px-4 py-2 bg-red-700/10 border border-red-700/30 rounded-full text-xs font-bold text-red-500 italic">
                            {format(range.from, "dd MMM")} — {format(range.to, "dd MMM")}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-black/40 p-5 rounded-xl border border-zinc-800 mb-6">
                        <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">{t('details.estimated_total', "Total Estimado")}</span>
                        <span className="text-3xl font-black text-red-500">{totalPrice.toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'es-ES')} €</span>
                      </div>

                      {error && <div className="p-4 bg-red-900/20 border border-red-700 text-red-500 rounded-xl text-sm font-bold text-center mb-4"><AlertCircle size={18} className="inline mr-2"/> {error}</div>}

                      <div className="mb-6 flex flex-col gap-3">
                        {isOwner ? (
                           <button disabled className="w-full py-4 bg-zinc-900 text-zinc-500 border border-zinc-700 font-black uppercase tracking-widest rounded-xl cursor-not-allowed">{t('details.is_your_ad', "ES TU ANUNCIO")}</button>
                        ) : advertisement?.status === 'vendido' ? (
                          <button disabled className="w-full py-4 bg-zinc-950 text-zinc-600 border border-zinc-800 font-black uppercase tracking-widest rounded-xl cursor-not-allowed opacity-50">{t('details.rented', "ALQUILADO")}</button>
                        ) : (
                          <>
                            <button onClick={handleRent} disabled={!!error || !range?.from || !range?.to} className="w-full py-5 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition shadow-lg active:scale-95 text-lg">{t('details.confirm_booking', "Confirmar Reserva")}</button>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={handleContactSeller} 
                                disabled={contactLoading} 
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded-xl border border-zinc-700 transition flex justify-center items-center gap-2 text-sm disabled:opacity-50"
                              >
                                <MessageCircle size={18} /> {t('details.contact_chat', "Contactar por Chat")}
                              </button>

                              {/* --- NUEVO BOTÓN DE REPORTAR EN ALQUILER --- */}
                              {token && !isOwner && (
                                <button
                                  onClick={() => navigate(`/reportar/${advertisement?.id}`)}
                                  className="py-3 px-4 bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-900/50 rounded-xl transition flex items-center justify-center"
                                  title={t('details.report_ad', 'Reportar anuncio')}
                                >
                                  <Flag size={20} />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DESCRIPCIÓN Y FICHA TÉCNICA (INTEGRADAS) --- */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">{t('details.description', "Descripción")}</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg font-medium italic">
              "{isEnglish && advertisement?.description_en ? advertisement.description_en : advertisement?.description}"
            </p>
          </div>
          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl h-fit">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic flex items-center gap-2">
              <Info size={20} className="text-red-700" /> {t('details.technical_sheet', "Ficha Técnica")}
            </h2>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2 font-bold"><span className="text-zinc-500 text-sm uppercase font-bold tracking-widest">{t('details.engine', "Motor")}</span><span>{advertisement?.vehicle?.fuel_type?.name}</span></li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2 font-bold"><span className="text-zinc-500 text-sm uppercase font-bold tracking-widest">{t('common.power', "Potencia")}</span><span>{advertisement?.vehicle?.power_hp} CV</span></li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2 font-bold"><span className="text-zinc-500 text-sm uppercase font-bold tracking-widest">{t('common.year', "Año")}</span><span>{advertisement?.vehicle?.year}</span></li>
              <li className="flex justify-between items-center pb-2 font-bold"><span className="text-zinc-500 text-sm uppercase font-bold tracking-widest">{t('common.location', "Ubicación")}</span><span>{advertisement?.province?.name}</span></li>
            </ul>
          </div>
        </div>
      </div>

     <style>{`
  /* --- ESTILOS BASE (MODO OSCURO) --- */
  .custom-rdp {
    --rdp-accent-color: #b91c1c;
    --rdp-accent-background-color: #b91c1c;
    --rdp-day_button-border-radius: 12px;
    
    background-color: #18181b; /* zinc-900 */
    color: white;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #27272a;
    transition: all 0.3s ease;
  }

  .custom-rdp .rdp-day_button {
    color: white !important;
  }

  .custom-rdp .rdp-caption_label {
    color: white !important;
    font-weight: 800;
    text-transform: uppercase;
  }

  /* --- MODO CLARO (Se activa con la clase .light en el html) --- */
  .light .custom-rdp {
    background-color: white;
    color: #18181b;
    border: 1px solid #e4e4e7; /* zinc-200 */
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }

  .light .custom-rdp .rdp-day_button {
    color: #18181b !important;
  }

  .light .custom-rdp .rdp-caption_label {
    color: #18181b !important;
  }

  .light .custom-rdp .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
    background-color: #f4f4f5 !important; /* zinc-100 */
  }

  /* --- ESTILOS COMUNES PARA EL RANGO (SIEMPRE LETRAS BLANCAS) --- */
  /* Días seleccionados y en medio del rango: forzamos texto blanco en ambos modos */
  .custom-rdp .rdp-selected .rdp-day_button,
  .custom-rdp .rdp-range_middle .rdp-day_button,
  .custom-rdp .rdp-range_start .rdp-day_button,
  .custom-rdp .rdp-range_end .rdp-day_button {
    color: white !important; 
    background-color: #b91c1c !important;
    opacity: 1;
  }

  .custom-rdp .rdp-range_middle {
    background-color: rgba(185, 28, 28, 0.8) !important;
  }

  /* Estilos de los extremos del rango */
  .custom-rdp .rdp-range_start .rdp-day_button,
  .custom-rdp .rdp-range_end .rdp-day_button {
    border-radius: 9999px !important;
  }

  /* Otros ajustes */
  .custom-rdp .rdp-disabled {
    opacity: 0.25;
    text-decoration: line-through;
  }

  .custom-rdp .rdp-weekday {
    color: #71717a;
    font-size: 0.7rem;
    font-weight: 900;
  }

  .custom-rdp .rdp-chevron {
    fill: #ef4444;
  }
`}</style>
    </div>
  );
};

export default RentDetail;