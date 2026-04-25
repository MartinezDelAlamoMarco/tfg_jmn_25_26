import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";

const AdvertisementsScreen = () => {
  const [myAds, setMyAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyAds = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.get(`${API_BASE_URL}/my-advertisements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Laravel ahora envía objetos anidados (Advertisement -> Vehicle -> Model -> Brand)
        setMyAds(response.data);
      } catch (error) {
        console.error("Error cargando tus anuncios", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAds();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este anuncio?"))
      return;

    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`${API_BASE_URL}/my-advertisements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyAds(myAds.filter((ad: any) => ad.id !== id));
      alert("Anuncio eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar", error);
      alert("No se pudo eliminar el anuncio");
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando tus anuncios..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Mis <span className="text-red-600">Vehículos</span>
          </h1>
          <Link
            to="/create-ad"
            className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-red-900/20"
          >
            + Publicar nuevo
          </Link>
        </div>

        {myAds.length === 0 ? (
          <div className="bg-zinc-800 p-12 rounded-2xl border border-zinc-700 text-center">
            <p className="text-zinc-500 text-lg mb-4">
              Aún no tienes ningún vehículo publicado.
            </p>
            <Link to="/create-ad" className="text-red-500 hover:underline font-bold">
              ¡Publica tu primer coche ahora!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAds.map((ad: any) => {
              // LÓGICA DE IMAGEN: Buscamos la principal, si no existe, la primera del array
              const mainImageUrl = ad.images?.find((img: any) => img.is_main)?.image_url 
                                || ad.images?.[0]?.image_url;

              return (
                <div
                  key={ad.id}
                  className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-red-600 transition-all duration-300 group flex flex-col"
                >
                  <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                    {mainImageUrl ? (
                      <img
                        src={mainImageUrl}
                        alt="Coche"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-600 italic bg-zinc-900">
                        Sin foto
                      </div>
                    )}
                    {/* Badge de estado del anuncio (Vendido, Disponible...) */}
                    <div className="absolute top-3 right-3 bg-red-700 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                      {ad.state?.name || "Activo"}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-black text-xl mb-1 uppercase tracking-tight">
                      {ad.vehicle?.model?.brand?.name} {ad.vehicle?.model?.name}
                    </h3>
                    
                    <p className="text-zinc-500 text-xs mb-4 flex items-center">
                      <span className="mr-1"></span> {ad.province?.name || 'Ubicación no especificada'}
                    </p>

                    <p className="text-white font-black text-3xl mb-6">
                      {Number(ad.price).toLocaleString("es-ES")} <span className="text-red-600">€</span>
                    </p>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => navigate(`/editar-anuncio/${ad.id}`)}
                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="flex-1 bg-zinc-900/50 hover:bg-red-950 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-red-500 border border-zinc-700 hover:border-red-900 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementsScreen;