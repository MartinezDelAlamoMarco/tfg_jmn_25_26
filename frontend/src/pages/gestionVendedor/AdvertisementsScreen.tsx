import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen"; // <--- IMPORTA AQUÍ

const AdvertisementsScreen = () => {
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyAds = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.get(`${API_BASE_URL}/my-advertisements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // --- CAMBIO AQUÍ: Usamos el nuevo componente ---
  if (loading) {
    return <LoadingScreen message="Cargando tus anuncios..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold italic uppercase tracking-tighter">
            Mis <span className="text-red-600">Vehículos</span>
          </h1>
          <Link
            to="/create-ad"
            className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg font-bold transition"
          >
            + Publicar nuevo
          </Link>
        </div>

        {myAds.length === 0 ? (
          <div className="bg-zinc-800 p-12 rounded-2xl border border-zinc-700 text-center">
            <p className="text-zinc-500 text-lg mb-4">
              Aún no tienes ningún vehículo publicado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAds.map((ad: any) => (
              <div
                key={ad.id}
                className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-red-900 transition group"
              >
                <div className="aspect-video bg-zinc-700 relative">
                  {ad.images?.[0] ? (
                    <img
                      src={ad.images[0].image_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 italic">
                      Sin foto
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {ad.state?.name}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl mb-1 uppercase">
                    {ad.vehicle?.model?.brand?.name} {ad.vehicle?.model?.name}
                  </h3>
                  <p className="text-red-500 font-extrabold text-2xl mb-4">
                    {Number(ad.price).toLocaleString("es-ES")} €
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/editar-anuncio/${ad.id}`)}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="flex-1 bg-zinc-900 hover:bg-red-950 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-red-500 border border-zinc-700 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementsScreen;