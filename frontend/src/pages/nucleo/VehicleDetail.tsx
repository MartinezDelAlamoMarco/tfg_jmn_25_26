import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import StarRating from "../../components/StarRating";

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

const VehicleDetail = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith("en");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

  const token = localStorage.getItem("auth_token");
  const userRole = localStorage.getItem("user_role");
  const owner = (advertisement as any)?.user || (advertisement as any)?.seller || (advertisement as any)?.owner || (advertisement as any)?.vehicle?.owner;

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);

        const img =
          response.data.images?.find((i: any) => i.is_main)?.image_url ||
          response.data.images?.[0]?.image_url;
        setMainImage(img || "");

        if (token) {
          try {
            const favResp = await axios.get(`${API_BASE_URL}/favorites`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const favIds = (favResp.data || []).map((a: any) => a.id);
            setIsFavorite(favIds.includes(response.data.id));
          } catch (e) {
            // Si falla la comprobación, asumimos que no es favorito
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
    window.addEventListener(
      "favorites:updated",
      onFavsUpdated as EventListener,
    );

    return () =>
      window.removeEventListener(
        "favorites:updated",
        onFavsUpdated as EventListener,
      );
  }, [id, token, t]);

  const handleDeleteAd = async () => {
    if (
      window.confirm(
        t('my_ads.delete_confirm', "⚠️ ¿Estás seguro de que quieres ELIMINAR este anuncio definitivamente por incumplir las normas?")
      )
    ) {
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
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
        window.dispatchEvent(
          new CustomEvent("favorites:updated", {
            detail: { adId: advertisement.id, action: "removed" },
          }),
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setIsFavorite(true);
        window.dispatchEvent(
          new CustomEvent("favorites:updated", {
            detail: { adId: advertisement.id, action: "added" },
          }),
        );
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
      alert(t('common.not_found', "No se pudo actualizar favoritos"));
    } finally {
      setFavoriteLoading(false);
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
        <Link to="/" className="text-red-700 hover:underline">
          {t('details.home_link', 'Volver al inicio')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="flex items-center text-zinc-400 hover:text-white mb-8 transition duration-200"
        >
          <span className="mr-2">←</span> {t('details.home_link', 'Volver al catálogo')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center shadow-2xl overflow-hidden">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt="Coche"
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <span className="text-zinc-500 italic text-lg">
                  {t('common.no_photo', 'Sin imagen disponible')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {advertisement.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img.image_url)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition ${
                    mainImage === img.image_url
                      ? "border-red-600"
                      : "border-zinc-700 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.image_url}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {owner ? (
              <Link
                to={`/usuario/${owner.id}`}
                state={{ fromAd: (advertisement as any)?.id }}
                className="mt-4 block bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-shadow shadow-sm"
                aria-label={`Ver perfil de ${owner.name || owner.username || 'vendedor'}`}>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center text-xl font-bold uppercase overflow-hidden">
                    {owner.avatar_url ? (
                      <img src={owner.avatar_url} alt={owner.name || 'Perfil'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{owner.name ? owner.name[0] : 'U'}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-lg">{owner.name || owner.username || 'Vendedor'}</div>
                    {owner.average_rating !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                        <StarRating value={Math.round(owner.average_rating)} size={14} />
                        <span>{Number(owner.average_rating).toFixed(1)} ({owner.reviews_count || 0})</span>
                      </div>
                    )}
                    <div className="text-zinc-400 text-sm mt-1 italic">{t('details.seller_details', 'Haz clic aquí para ver el perfil del vendedor')}</div>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>

          <div className="flex flex-col">
            <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  {advertisement.state?.name || t('common.unknown_state', 'Estado desconocido')}
                </span>
                <span className="text-zinc-500 text-sm">
                  {t('details.views', 'Vistas')}: {advertisement.views || 0}
                </span>
              </div>

              <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
                {advertisement.vehicle?.model?.brand?.name}{" "}
                {advertisement.vehicle?.model?.name}
              </h1>
              <p className="text-zinc-400 text-lg mb-6 flex items-center">
                <span className="mr-2">📍</span>{" "}
                {advertisement.province?.name || "España"}
              </p>

              <div className="text-5xl font-black text-white mb-8">
                {Number(advertisement.price).toLocaleString("es-ES")}{" "}
                <span className="text-red-700">€</span>
              </div>

              {token && userRole !== "admin" && (
                <div className="mb-4">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isFavorite === null || favoriteLoading}
                    className={`w-full py-3 mb-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isFavorite ? "bg-red-700 hover:bg-red-600 text-white" : "bg-zinc-700 hover:bg-zinc-600 text-white"} ${isFavorite === null || favoriteLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isFavorite === null || favoriteLoading ? (
                      <span className="inline-flex items-center justify-center">
                        <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full"></span>
                      </span>
                    ) : isFavorite ? (
                      <>
                        <Heart size={20} className="fill-current" />
                        {t('favorites.remove_favorite', 'Quitar favorito')}
                      </>
                    ) : (
                      <>
                        <Heart size={20} />
                        {t('favorites.no_favorites', 'Añadir a favoritos')}
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">
                    {t('common.km', 'Kilómetros')}
                  </p>
                  <p className="text-xl font-bold">
                    {advertisement.vehicle?.km?.toLocaleString("es-ES") || 0} km
                  </p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">
                    {t('common.year', 'Año')}
                  </p>
                  <p className="text-xl font-bold">
                    {advertisement.vehicle?.year || "-"}
                  </p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">
                    {t('common.fuel', 'Combustible')}
                  </p>
                  <p className="text-xl font-bold">
                    {advertisement.vehicle?.fuel_type?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">
                    {t('common.power', 'Potencia (CV)')}
                  </p>
                  <p className="text-xl font-bold">
                    {advertisement.vehicle?.power_hp || 0} CV
                  </p>
                </div>
              </div>

              {userRole === "admin" ? (
                <div className="mt-6 bg-red-950/30 p-6 rounded-xl border border-red-900 text-center">
                  <h3 className="text-red-500 font-bold uppercase text-sm tracking-widest mb-4">
                    🛠️ Herramientas de Moderador
                  </h3>
                  <button
                    onClick={handleDeleteAd}
                    className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-lg shadow-red-900/20"
                  >
                    Eliminar Anuncio
                  </button>
                </div>
              ) : (
                <>
                  {token ? (
                    <button className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-lg shadow-red-900/20 active:scale-95 mb-6">
                      {t('details.contact_seller', 'Contactar con el vendedor')}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white text-center font-black uppercase tracking-widest rounded-xl transition duration-300 mb-6"
                    >
                      Inicia sesión para contactar
                    </Link>
                  )}

                  <div className="pt-4 border-t border-zinc-700/50 flex justify-end">
                    {token ? (
                      <Link
                        to={`/anuncios/${advertisement.id}/reportar`}
                        className="text-zinc-500 hover:text-red-500 text-xs font-bold uppercase flex items-center gap-2 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        {t('details.report_ad', 'Denunciar este anuncio')}
                      </Link>
                    ) : (
                      <span className="text-zinc-600 text-[10px] uppercase font-black italic">
                        {t('details.login_to_report', 'Inicia sesión para denunciar')}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">
              {t('details.description', 'Descripción')}
            </h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
              {isEnglish && advertisement.description_en
                ? advertisement.description_en
                : advertisement.description}
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">
              {t('details.tech_sheet', 'Ficha Técnica')}
            </h2>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">
                  {t('common.transmission', 'Transmisión')}
                </span>
                <span className="font-semibold">
                  {advertisement.vehicle?.transmission?.name || "Manual"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">
                  {t('common.doors', 'Puertas')}
                </span>
                <span className="font-semibold">
                  {advertisement.vehicle?.doors || "5"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">
                  {t('common.color', 'Color')}
                </span>
                <span className="font-semibold">
                  {advertisement.vehicle?.tonality?.name || "N/A"}
                </span>
              </li>
              <li className="flex justify-between items-center pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">
                  {t('common.location', 'Ubicación')}
                </span>
                <span className="font-semibold">
                  {advertisement.province?.name || "N/A"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;