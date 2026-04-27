import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";

interface Advertisement {
  id: number;
  price: string;
  description: string;
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  
  const token = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);
        
        const img = response.data.images?.find((i: any) => i.is_main)?.image_url 
                 || response.data.images?.[0]?.image_url;
        setMainImage(img || "");

        if (token) {
          try {
            const favResp = await axios.get(`${API_BASE_URL}/favorites`, {
              headers: { Authorization: `Bearer ${token}` }
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
        setError("No se pudo cargar la información del vehículo.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();

    const onFavsUpdated = (e: any) => {
      const detail = e?.detail || {};
      if (!detail || !detail.adId) return;
      if (String(detail.adId) === String(id)) {
        setIsFavorite(detail.action === 'added');
      }
    };
    window.addEventListener('favorites:updated', onFavsUpdated as EventListener);

    return () => window.removeEventListener('favorites:updated', onFavsUpdated as EventListener);
  }, [id, token]);

  const handleDeleteAd = async () => {
    if (window.confirm("⚠️ ¿Estás seguro de que quieres ELIMINAR este anuncio definitivamente por incumplir las normas?")) {
      try {
        await axios.delete(`${API_BASE_URL}/advertisements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Anuncio eliminado correctamente.");
        navigate('/admin/panel');
      } catch (error) {
        console.error("Error eliminando el anuncio", error);
        alert("Hubo un error al eliminar el anuncio.");
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!token || !advertisement) return;
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { adId: advertisement.id, action: 'removed' } }));
      } else {
        await axios.post(`${API_BASE_URL}/favorites/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
        window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { adId: advertisement.id, action: 'added' } }));
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
      alert('No se pudo actualizar favoritos');
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
        <p className="text-xl mb-4">{error || "Vehículo no encontrado"}</p>
        <Link to="/" className="text-red-700 hover:underline">
          Volver al inicio
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
          <span className="mr-2">←</span> Volver al catálogo
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
                <span className="text-zinc-500 italic text-lg">Sin imagen disponible</span>
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
                  <img src={img.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  {advertisement.state?.name || "Disponible"}
                </span>
                <span className="text-zinc-500 text-sm">
                  Vistas: {advertisement.views || 0}
                </span>
              </div>

              <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
                {advertisement.vehicle?.model?.brand?.name} {advertisement.vehicle?.model?.name}
              </h1>
              <p className="text-zinc-400 text-lg mb-6 flex items-center">
                <span className="mr-2">📍</span> {advertisement.province?.name || "España"}
              </p>

              <div className="text-5xl font-black text-white mb-8">
                {Number(advertisement.price).toLocaleString("es-ES")}{" "}
                <span className="text-red-700">€</span>
              </div>

              {token && userRole !== 'admin' && (
                <div className="mb-4">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isFavorite === null || favoriteLoading}
                    className={`w-full py-3 mb-4 rounded-xl font-bold transition ${isFavorite ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'} ${isFavorite === null || favoriteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isFavorite === null || favoriteLoading ? (
                      <span className="inline-flex items-center justify-center">
                        <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full"></span>
                      </span>
                    ) : isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Kilómetros</p>
                  <p className="text-xl font-bold">{advertisement.vehicle?.km?.toLocaleString("es-ES") || 0} km</p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Año</p>
                  <p className="text-xl font-bold">{advertisement.vehicle?.year || "-"}</p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Combustible</p>
                  <p className="text-xl font-bold">{advertisement.vehicle?.fuel_type?.name || "N/A"}</p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Potencia</p>
                  <p className="text-xl font-bold">{advertisement.vehicle?.power_hp || 0} CV</p>
                </div>
              </div>

              {userRole === 'admin' ? (
                <div className="mt-6 bg-red-950/30 p-6 rounded-xl border border-red-900 text-center">
                  <h3 className="text-red-500 font-bold uppercase text-sm tracking-widest mb-4">🛠️ Herramientas de Moderador</h3>
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
                        Contactar con el vendedor
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Denunciar este anuncio
                        </Link>
                    ) : (
                        <span className="text-zinc-600 text-[10px] uppercase font-black italic">Inicia sesión para denunciar</span>
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
              Descripción
            </h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
              {advertisement.description}
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 border-b border-zinc-700 pb-2 uppercase italic">
              Ficha Técnica
            </h2>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">Transmisión</span>
                <span className="font-semibold">{advertisement.vehicle?.transmission?.name || "Manual"}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">Puertas</span>
                <span className="font-semibold">{advertisement.vehicle?.doors || "5"}</span>
              </li>
              <li className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">Color</span>
                <span className="font-semibold">{advertisement.vehicle?.tonality?.name || "N/A"}</span>
              </li>
              <li className="flex justify-between items-center pb-2">
                <span className="text-zinc-500 text-sm uppercase font-bold">Ubicación</span>
                <span className="font-semibold">{advertisement.province?.name || "N/A"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;