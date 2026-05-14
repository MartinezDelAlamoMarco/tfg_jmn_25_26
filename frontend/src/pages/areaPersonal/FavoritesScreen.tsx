import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Interfaz actualizada para el modelo de datos real de Laravel (anidado)
interface Advertisement {
  id: number;
  price: number;
  description: string;
  views: number;
  state?: { name: string };
  images: { image_url: string; is_main: boolean }[];
  vehicle?: {
    model?: {
      name: string;
      brand?: { name: string };
    };
  };
}

const FavoritesScreen = () => {
  const { t, i18n } = useTranslation();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFavs, setLoadingFavs] = useState<Record<number, boolean>>({});
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    // Cargamos los anuncios favoritos y los ids
    handleGetAdvertisements();

    // Re-escuchar cambios en favoritos desde otras páginas
    const onFavsUpdated = (_e: any) => {
      handleGetAdvertisements();
    };
    window.addEventListener("favorites:updated", onFavsUpdated as EventListener);
    return () => window.removeEventListener("favorites:updated", onFavsUpdated as EventListener);
  }, []);

  const handleGetAdvertisements = () => {
    setErrorMessage(null);
    setLoading(true);
    const tokenLocal = localStorage.getItem("auth_token");
    // If not authenticated, skip calling the API
    if (!tokenLocal) {
      setAdvertisements([]);
      setFavoriteIds([]);
      setFavoritesLoaded(true);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${tokenLocal}` },
      })
      .then((res) => {
        setAdvertisements(res.data);
        const ids = (res.data || []).map((a: any) => a.id);
        setFavoriteIds(ids);
        console.debug("Favorites response:", res);
      })
      .catch((err) => {
        console.error("Error fetching favorites:", err);
        setErrorMessage(t('favorites.error_fetch', "Error al obtener vehículos favoritos"));
      })
      .finally(() => {
        setLoading(false);
        setFavoritesLoaded(true);
      });
  };

  const handleToggleFavorite = async (adId: number) => {
    const tokenLocal = localStorage.getItem("auth_token");
    if (!tokenLocal) {
      alert(t('favorites.login_required_toggle', "Inicia sesión para marcar favoritos"));
      return;
    }

    try {
      setLoadingFavs((prev) => ({ ...prev, [adId]: true }));

      if (favoriteIds.includes(adId)) {
        await axios.delete(`${API_BASE_URL}/favorites/${adId}`, {
          headers: { Authorization: `Bearer ${tokenLocal}` },
        });
        setFavoriteIds((prev) => prev.filter((id) => id !== adId));
        // Si estamos en la pantalla de favoritos, remover del listado
        setAdvertisements((prev) => prev.filter((a) => a.id !== adId));
        window.dispatchEvent(
          new CustomEvent("favorites:updated", { detail: { adId, action: "removed" } })
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites/${adId}`,
          {},
          { headers: { Authorization: `Bearer ${tokenLocal}` } }
        );
        setFavoriteIds((prev) => [...prev, adId]);
        window.dispatchEvent(
          new CustomEvent("favorites:updated", { detail: { adId, action: "added" } })
        );
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
      alert(t('favorites.error_toggle', "No se pudo actualizar favoritos"));
    } finally {
      setLoadingFavs((prev) => {
        const out = { ...prev };
        delete out[adId];
        return out;
      });
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Listado de Vehículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
          ) : errorMessage ? (
            <div className="col-span-full bg-red-900/20 border border-red-700 p-4 rounded-xl text-red-400 text-center">
              {errorMessage}
            </div>
          ) : !advertisements || advertisements.length === 0 ? (
            <div className="col-span-full bg-zinc-800/10 border border-zinc-700 p-8 rounded-xl text-zinc-300 text-center">
              {!token ? (
                <div>
                  <p className="mb-2">{t('favorites.login_required_view', "Inicia sesión para ver tus favoritos.")}</p>
                  <Link to="/login" className="text-red-700 hover:underline">
                    {t('navbar.login', "Iniciar sesión")}
                  </Link>
                </div>
              ) : (
                <p className="text-lg font-semibold">
                  {t('favorites.empty_favorites', "Aún no se han marcado favoritos.")}
                </p>
              )}
            </div>
          ) : (
            advertisements.map((v) => (
              <div
                key={v.id}
                className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 flex flex-col hover:shadow-2xl transition"
              >
                <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden border border-zinc-700">
                  {v.images && v.images.length > 0 ? (
                    <img
                      src={
                        v.images.find((img) => img.is_main)?.image_url ||
                        v.images[0].image_url
                      }
                      alt={t('create_ad.vehicle', 'Vehículo')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      {t('common.no_photo', "Sin foto")}
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {v.vehicle?.model?.brand?.name} {v.vehicle?.model?.name}
                  </h3>
                  <span className="px-2 py-1 text-[10px] bg-red-700/20 text-red-300 rounded-full font-bold uppercase">
                    {v.state?.name}
                  </span>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <p className="text-3xl font-black">
                    {Number(v.price).toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'es-ES')} €
                  </p>
                  <p className="text-xs text-zinc-500">{t('details.views', 'Vistas')}: {v.views}</p>
                </div>

                {token && (
                  <div className="mb-4">
                    <button
                      onClick={() => handleToggleFavorite(v.id)}
                      disabled={!favoritesLoaded || !!loadingFavs[v.id]}
                      className={`px-3 py-2 rounded-lg font-semibold transition ${favoriteIds.includes(v.id) ? "bg-red-700 hover:bg-red-600 text-white" : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"} ${(!favoritesLoaded || loadingFavs[v.id]) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {(!favoritesLoaded || loadingFavs[v.id]) ? (
                        <span className="inline-flex items-center justify-center">
                          <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full"></span>
                        </span>
                      ) : favoriteIds.includes(v.id) ? (
                        t('favorites.remove_favorite', "Quitar favorito")
                      ) : (
                        t('favorites.no_favorites', "Añadir a favoritos")
                      )}
                    </button>
                  </div>
                )}

                <Link
                  to={`/advertisement/${v.id}`}
                  className="mt-auto block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition"
                >
                  {t('home.view_details', "Ver detalles")}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesScreen;