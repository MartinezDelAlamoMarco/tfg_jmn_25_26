import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link } from "react-router-dom";

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
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    handleGetAdvertisements();
    // Si estamos autenticados, cargamos los ids favoritos del usuario
    if (localStorage.getItem("auth_token")) {
      axios
        .get(`${API_BASE_URL}/favorites`)
        .then((res) => {
          const ids = (res.data || []).map((a: any) => a.id);
          setFavoriteIds(ids);
        })
        .catch(() => {
          // Ignoramos errores aquí; no bloquea la carga de anuncios
        });
    }
  }, []);

  const handleGetAdvertisements = () => {
    setErrorMessage(null);
    setLoading(true);
    // If not authenticated, skip calling the API
    if (!localStorage.getItem("auth_token")) {
      setAdvertisements([]);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/favorites`)
      .then((res) => {
        setAdvertisements(res.data);
        console.debug("Favorites response:", res);
      })
      .catch((err) => {
        console.error("Error fetching favorites:", err);
        setErrorMessage("Error al obtener vehículos favoritos");
      })
      .finally(() => setLoading(false));
  };

  const handleToggleFavorite = async (adId: number) => {
    if (!localStorage.getItem("auth_token")) {
      alert("Inicia sesión para marcar favoritos");
      return;
    }

    try {
      if (favoriteIds.includes(adId)) {
        await axios.delete(`${API_BASE_URL}/favorites/${adId}`);
        setFavoriteIds((prev) => prev.filter((id) => id !== adId));
      } else {
        await axios.post(`${API_BASE_URL}/favorites/${adId}`);
        setFavoriteIds((prev) => [...prev, adId]);
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
      alert("No se pudo actualizar favoritos");
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
                  <p className="mb-2">Inicia sesión para ver tus favoritos.</p>
                  <Link to="/login" className="text-red-700 hover:underline">
                    Iniciar sesión
                  </Link>
                </div>
              ) : (
                <p className="text-lg font-semibold">
                  Aún no se han marcado favoritos.
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
                      alt="Coche"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      Sin foto
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
                    {Number(v.price).toLocaleString("es-ES")} €
                  </p>
                  <p className="text-xs text-zinc-500">Vistas: {v.views}</p>
                </div>

                {token && (
                  <div className="mb-4">
                    <button
                      onClick={() => handleToggleFavorite(v.id)}
                      className={`px-3 py-2 rounded-lg font-semibold transition ${favoriteIds.includes(v.id) ? "bg-red-700 hover:bg-red-600 text-white" : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"}`}
                    >
                      {favoriteIds.includes(v.id)
                        ? "Quitar favorito"
                        : "Añadir a favoritos"}
                    </button>
                  </div>
                )}

                <Link
                  to={`/advertisement/${v.id}`}
                  className="mt-auto block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition"
                >
                  Ver detalles
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
