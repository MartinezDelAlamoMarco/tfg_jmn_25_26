import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Gauge, 
  MessageCircle, 
  Trash2, 
  Zap, 
  Settings, 
  Fuel, 
  DoorOpen, 
  UserCheck, 
  ShieldAlert,
  Info
} from "lucide-react";
import { useTranslation } from "react-i18next";
import StarRating from "../../components/StarRating";

interface Advertisement {
  id: number;
  price: string;
  description: string;
  description_en?: string;
  views: number;
  is_rent?: boolean;
  state?: { name: string };
  province?: { name: string };
  user_id?: number;
  user?: any;
  seller?: any;
  images: { image_url: string; is_main: boolean }[];
  vehicle?: {
    km: number;
    year: number;
    power_hp: number;
    doors: number;
    owner_id?: number;
    owner?: any;
    fuel_type?: { name: string };
    transmission?: { name: string };
    tonality?: { name: string };
    model?: {
      name: string;
      brand?: { name: string };
    };
  };
}

const VehicleDetail = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith("en");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados Unificados
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const token = localStorage.getItem("auth_token");
  const userRole = localStorage.getItem("user_role");
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        // Usamos la ruta del source 1 pero con la base del source 2 para consistencia
        const response = await axios.get(`${API_BASE_URL}/advertisement/${id}`);
        const data = response.data;
        setAdvertisement(data);

        // Galería: Seleccionar imagen principal
        const img = data.images?.find((i: any) => i.is_main)?.image_url || data.images?.[0]?.image_url;
        setMainImage(img || "");

        // Lógica de Vendedor (Source 1)
        const foundId = data.user_id || data.user?.id || data.vehicle?.owner_id;
        if (foundId) setSellerId(foundId.toString());

        // Verificación de Favoritos (Mezcla optimizada)
        if (token) {
          try {
            const favCheck = await axios.get(`${API_BASE_URL}/favorites/check/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(favCheck.data.is_favorite);
          } catch (e) {
            // Fallback si el endpoint check no existe (Lógica Source 2)
            const favResp = await axios.get(`${API_BASE_URL}/favorites`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(favResp.data.some((f: any) => f.id === parseInt(id!)));
          }
        }
      } catch (err) {
        setError(t('edit_ad.error_loading', "No se pudo cargar la información del vehículo."));
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();

    // Sincronización de eventos globales para favoritos (Ambos sources lo pedían)
    const onFavsUpdated = (e: any) => {
      if (String(e?.detail?.adId) === String(id)) {
        setIsFavorite(e.detail.action === "added");
      }
    };
    window.addEventListener("favorites:updated", onFavsUpdated as EventListener);
    return () => window.removeEventListener("favorites:updated", onFavsUpdated as EventListener);
  }, [id, token, t]);

  const handleToggleFavorite = async () => {
    if (!token || !advertisement) return alert(t('common.login_required', 'Inicia sesión para esto'));
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_BASE_URL}/favorites/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      window.dispatchEvent(new CustomEvent("favorites:updated", {
        detail: { adId: advertisement.id, action: newStatus ? "added" : "removed" }
      }));
    } catch (err) {
      alert(t('common.error', "Error al actualizar favoritos"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (window.confirm(t('my_ads.delete_confirm', "¿Eliminar definitivamente?"))) {
      try {
        await axios.delete(`${API_BASE_URL}/advertisement/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(userRole === 'admin' ? '/admin/panel' : '/');
      } catch (err) {
        alert(t('common.error', "No se pudo eliminar."));
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-700"></div>
    </div>
  );

  if (error || !advertisement) return (
    <div className="min-h-screen flex flex-col justify-center items-center text-white bg-zinc-950 gap-4">
      <ShieldAlert size={48} className="text-red-600 animate-pulse" />
      <p className="text-xl">{error || t('common.not_found')}</p>
      <Link to="/" className="text-red-700 hover:underline">{t('details.home_link')}</Link>
    </div>
  );

  const owner = advertisement.user || advertisement.seller || advertisement.vehicle?.owner;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-10 transition-colors font-bold uppercase text-xs tracking-widest">
          <span className="mr-2 text-red-600">←</span> {t('details.home_link', 'Volver al catálogo')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LADO IZQUIERDO: Galería y Detalles (66%) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative group aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
              {mainImage ? (
                <img src={mainImage} alt="Vehicle" className="w-full h-full object-cover animate-fade-in" />
              ) : (
                <span className="text-zinc-700 italic font-black text-4xl">{t('common.no_photo')}</span>
              )}
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-5 gap-4">
              {advertisement.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img.image_url)}
                  className={`aspect-video rounded-2xl border-2 transition-all overflow-hidden ${
                    mainImage === img.image_url ? "border-red-600 scale-105 shadow-lg shadow-red-600/20" : "border-zinc-800 opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} className="w-full h-full object-cover" alt="thumb" />
                </button>
              ))}
            </div>

            {/* Ficha Técnica Estilo Moderno */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: t('common.km'), value: `${advertisement.vehicle?.km?.toLocaleString()} km`, icon: <Gauge size={20}/> },
                 { label: t('common.year'), value: advertisement.vehicle?.year, icon: <Calendar size={20}/> },
                 { label: t('common.fuel'), value: advertisement.vehicle?.fuel_type?.name, icon: <Fuel size={20}/> },
                 { label: t('common.power'), value: `${advertisement.vehicle?.power_hp} CV`, icon: <Zap size={20}/> }
               ].map((item, idx) => (
                 <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl group hover:border-red-600/50 transition-colors">
                   <div className="text-red-500 mb-3">{item.icon}</div>
                   <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{item.label}</p>
                   <p className="text-lg font-bold">{item.value || 'N/A'}</p>
                 </div>
               ))}
            </div>

            {/* Descripción */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem]">
              <h2 className="text-xl font-black mb-6 uppercase italic flex items-center gap-2">
                <div className="w-1.5 h-6 bg-red-600"></div> {t('details.description')}
              </h2>
              <p className="text-zinc-400 leading-relaxed text-lg italic whitespace-pre-wrap">
                "{isEnglish && advertisement.description_en ? advertisement.description_en : advertisement.description}"
              </p>
            </div>
          </div>

          {/* LADO DERECHO: Panel de Control (33%) */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] sticky top-28 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-red-600/20 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {advertisement.is_rent ? t('common.rent', 'Alquiler') : t('common.sale', 'Venta')}
                  </span>
                  <h1 className="text-4xl font-black mt-4 uppercase leading-none italic">
                    {advertisement.vehicle?.model?.brand?.name} <br/>
                    <span className="text-zinc-500 not-italic font-medium">{advertisement.vehicle?.model?.name}</span>
                  </h1>
                </div>
                <button 
                  onClick={handleToggleFavorite} 
                  disabled={favoriteLoading}
                  className={`p-4 rounded-2xl transition-all active:scale-90 ${
                    isFavorite ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <Heart fill={isFavorite ? "currentColor" : "none"} size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 text-zinc-500 font-bold text-xs uppercase mb-8 pb-8 border-b border-zinc-800">
                <div className="flex items-center gap-1.5 text-red-500"><MapPin size={16}/> {advertisement.province?.name || 'España'}</div>
                <div className="flex items-center gap-1.5"><Info size={16}/> {advertisement.views || 0} vistas</div>
              </div>

              <div className="text-6xl font-black text-white mb-10 tracking-tighter">
                {Number(advertisement.price).toLocaleString()} <span className="text-2xl text-red-600 font-bold">€</span>
              </div>

              {/* Botón de Contacto (Mezclado) */}
              {token ? (
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-4 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95 uppercase tracking-widest text-sm mb-6">
                  <MessageCircle size={22} /> {t('details.contact_seller')}
                </button>
              ) : (
                <Link to="/login" className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white text-center font-black py-6 rounded-2xl transition-all uppercase tracking-widest text-sm mb-6">
                  {t('details.login_to_report', 'Inicia sesión para contactar')}
                </Link>
              )}

              {/* Perfil del Vendedor (Source 2) */}
              {owner && (
                <Link to={`/usuario/${owner.id}`} className="flex items-center gap-4 p-5 bg-zinc-950/50 rounded-3xl border border-zinc-800 hover:border-red-600 transition-colors group">
                  <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-red-500 overflow-hidden border border-zinc-700">
                    {owner.avatar_url ? <img src={owner.avatar_url} className="w-full h-full object-cover" /> : owner.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{t('common.seller')}</p>
                    <p className="text-lg font-bold group-hover:text-red-500 transition-colors">{owner.name || 'Usuario'}</p>
                    {owner.average_rating && <StarRating value={Math.round(owner.average_rating)} size={12} />}
                  </div>
                </Link>
              )}

              {/* Acciones Admin/Propietario (Source 1) */}
              {(userRole === 'admin' || (currentUserId && sellerId && currentUserId.toString() === sellerId)) && (
                <button 
                  onClick={handleDeleteAd} 
                  className="w-full mt-8 text-zinc-600 hover:text-red-500 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-tighter transition-colors border-t border-zinc-800/50"
                >
                  <Trash2 size={14} /> {t('common.delete')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;