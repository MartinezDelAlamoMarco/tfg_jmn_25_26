import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Heart, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import StarRating from "../../components/StarRating";

interface Advertisement {
  id: number;
  price: string;
  description: string;
  description_en?: string;
  views: number;
  status: string; // <-- AÑADIDO: Para 'disponible', 'reservado', 'vendido'
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

const VehicleDetail = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith("en");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

  const token = localStorage.getItem("auth_token");
  const userRole = localStorage.getItem("user_role");
  
  // ESTADO ROBUSTO PARA EL ID DEL USUARIO
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 1. OBTENER EL ID DEL USUARIO ACTUAL (A PRUEBA DE FALLOS)
  useEffect(() => {
    let storedId = localStorage.getItem('user_id');
    
    if (!storedId) {
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try { storedId = JSON.parse(storedUserStr).id; } catch(e) {}
      }
    }

    if (storedId) {
      setCurrentUserId(String(storedId));
    } else if (token) {
      axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data && res.data.id) {
            setCurrentUserId(String(res.data.id));
            localStorage.setItem('user_id', res.data.id);
          }
        })
        .catch(err => console.error("No se pudo identificar al usuario", err));
    }
  }, [token]);

  // Extraemos el propietario de forma segura
  const owner = (advertisement as any)?.user || (advertisement as any)?.seller || (advertisement as any)?.vehicle?.owner;
  const ownerId = advertisement?.vehicle?.owner_id || (advertisement as any)?.user_id || owner?.id;

  // COMPROBACIÓN ESTRICTA COMO TEXTO
  const isOwner = currentUserId !== null && ownerId !== undefined && String(currentUserId) === String(ownerId);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);

        const img = response.data.images?.find((i: any) => i.is_main)?.image_url || response.data.images?.[0]?.image_url;
        setMainImage(img || "");

        if (token) {
          try {
            const favResp = await axios.get(`${API_BASE_URL}/favorites`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const favIds = (favResp.data || []).map((a: any) => a.id);
            setIsFavorite(favIds.includes(response.data.id));
          } catch (e) {
            setIsFavorite(false);
          }
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error("Error al cargar el vehículo:", err);
        setError(t('edit_ad.error_loading', "No se pudo cargar la información del vehículo."));
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();

    const onFavsUpdated = (e: any) => {
      const detail = e?.detail || {};
      if (!detail || !detail.adId) return;
      if (String(detail.adId) === String(id)) {
        setIsFavorite(detail.action === "added");
      }
    };
    window.addEventListener("favorites:updated", onFavsUpdated as EventListener);
    return () => window.removeEventListener("favorites:updated", onFavsUpdated as EventListener);
  }, [id, token, t]);

  const handleDeleteAd = async () => {
    if (window.confirm(t('my_ads.delete_confirm', "⚠️ ¿Estás seguro de que quieres ELIMINAR este anuncio definitivamente?"))) {
      try {
        await axios.delete(`${API_BASE_URL}/advertisements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(t('common.delete', "Anuncio eliminado correctamente."));
        navigate("/admin/panel");
      } catch (error) {
        console.error("Error eliminando el anuncio", error);
        alert(t('common.not_found', "Hubo un error al eliminar el anuncio."));
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!token || !advertisement) return;
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavorite(false);
        window.dispatchEvent(new CustomEvent("favorites:updated", { detail: { adId: advertisement.id, action: "removed" } }));
      } else {
        await axios.post(`${API_BASE_URL}/favorites/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavorite(true);
        window.dispatchEvent(new CustomEvent("favorites:updated", { detail: { adId: advertisement.id, action: "added" } }));
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
      alert(t('common.not_found', "No se pudo actualizar favoritos"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!token) {
        navigate('/login');
        return;
    }
    if (!advertisement || !ownerId) return;
    
    try {
      await axios.post(`${API_BASE_URL}/conversations`, {
        advertisement_id: advertisement.id,
        seller_id: ownerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/mis-mensajes');
    } catch (err) {
      console.error("Error al iniciar la conversación", err);
      alert("No se pudo iniciar el chat con el vendedor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (error || !advertisement) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white bg-zinc-900">
        <p className="text-xl mb-4">{error || t('common.not_found', "Vehículo no encontrado")}</p>
        <Link to="/" className="text-red-700 hover:underline">{t('details.home_link', 'Volver al inicio')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="flex items-center text-zinc-400 hover:text-white mb-8 transition duration-200">
          <span className="mr-2">←</span> {t('details.home_link', 'Volver al catálogo')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center shadow-2xl overflow-hidden relative">
              
              {/* --- ETIQUETAS DE ESTADO (NUEVO) --- */}
              {advertisement.status === 'reservado' && (
                <div className="absolute top-4 left-4 z-10 bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-widest animate-pulse">
                  ⚠️ Reservado
                </div>
              )}
              {advertisement.status === 'vendido' && (
                <div className="absolute top-4 left-4 z-10 bg-zinc-700 text-zinc-300 text-[10px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-widest border border-zinc-500">
                  🏁 Vendido
                </div>
              )}

              {mainImage ? (
                <img src={mainImage} alt="Coche" className="w-full h-full object-cover animate-fade-in" />
              ) : (
                <span className="text-zinc-500 italic text-lg">{t('common.no_photo', 'Sin imagen disponible')}</span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {advertisement.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img.image_url)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition ${mainImage === img.image_url ? "border-red-600" : "border-zinc-700 opacity-50 hover:opacity-100"}`}
                >
                  <img src={img.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {owner && (
              <Link
                to={`/usuario/${owner.id}`}
                className="mt-4 block bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center text-xl font-bold uppercase overflow-hidden">
                    {owner.avatar_url ? (
                      <img src={owner.avatar_url} alt={owner.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{owner.name ? owner.name[0] : 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{owner.name || 'Vendedor'}</div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                      <StarRating value={Math.round(owner.average_rating || 0)} size={14} />
                      <span>{Number(owner.average_rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className="flex flex-col">
            <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  {advertisement.state?.name || "Venta"}
                </span>
                <span className="text-zinc-500 text-sm">
                  {t('details.views', 'Vistas')}: {advertisement.views || 0}
                </span>
              </div>

              <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
                {advertisement.vehicle?.model?.brand?.name} {advertisement.vehicle?.model?.name}
              </h1>
              
              <div className="text-5xl font-black text-white mb-8 mt-4">
                {Number(advertisement.price).toLocaleString("es-ES")} <span className="text-red-700">€</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Km</p>
                  <p className="text-xl font-bold">{advertisement.vehicle?.km?.toLocaleString("es-ES")} km</p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Año</p>
                  <p className="text-xl font-bold">{advertisement.vehicle?.year}</p>
                </div>
              </div>

              {userRole === "admin" ? (
                <button onClick={handleDeleteAd} className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-900/20">
                  Eliminar Anuncio (ADMIN)
                </button>
              ) : (
                <>
                  {isOwner ? (
                    <button disabled className="w-full py-4 bg-zinc-900 text-zinc-500 border border-zinc-700 font-black uppercase tracking-widest rounded-xl cursor-not-allowed mb-4">
                      ES TU ANUNCIO
                    </button>
                  ) : advertisement.status === 'vendido' ? (
                    <button disabled className="w-full py-4 bg-zinc-950 text-zinc-600 border border-zinc-800 font-black uppercase tracking-widest rounded-xl cursor-not-allowed mb-4 opacity-50">
                      VEHÍCULO NO DISPONIBLE
                    </button>
                  ) : (
                    <button 
                      onClick={handleContactSeller} 
                      className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-900/20 mb-4 flex justify-center items-center gap-2 active:scale-95"
                    >
                      <MessageCircle size={20} />
                      {t('details.contact_seller', 'Contactar con el vendedor')}
                    </button>
                  )}

                  {token && !isOwner && (
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isFavorite ? "bg-red-700/20 text-red-500 border border-red-700/50" : "bg-zinc-700 hover:bg-zinc-600 text-white"}`}
                    >
                      <Heart size={20} className={isFavorite ? "fill-current" : ""} />
                      {isFavorite ? t('favorites.remove_favorite', 'Quitar favorito') : t('favorites.no_favorites', 'Añadir a favoritos')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Descripción y Ficha Técnica */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">Descripción</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
              {isEnglish && advertisement.description_en ? advertisement.description_en : advertisement.description}
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">Ficha Técnica</h2>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2 font-bold">
                <span className="text-zinc-500 text-sm uppercase">Transmisión</span>
                <span>{advertisement.vehicle?.transmission?.name || "Manual"}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2 font-bold">
                <span className="text-zinc-500 text-sm uppercase">Combustible</span>
                <span>{advertisement.vehicle?.fuel_type?.name}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2 font-bold">
                <span className="text-zinc-500 text-sm uppercase">Puertas</span>
                <span>{advertisement.vehicle?.doors}</span>
              </li>
              <li className="flex justify-between items-center pb-2 font-bold">
                <span className="text-zinc-500 text-sm uppercase">Ubicación</span>
                <span>{advertisement.province?.name}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;