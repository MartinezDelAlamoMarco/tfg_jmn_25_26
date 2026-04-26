import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import LoadingScreen from "../../components/LoadingScreen";

interface Advertisement {
  id: number;
  price: string;
  description: string;
  images: { image_url: string }[];
  vehicle: {
    model: {
      name: string;
      brand: { name: string };
    };
  };
}

const AlquilerScreen = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usamos el endpoint /vehicles que ya tienes en tu api.php
    axios.get(`${API_BASE_URL}/vehicles`) 
      .then(res => {
        // Filtramos o mapeamos si es necesario, asumiendo que el 
        // backend devuelve la lista de anuncios (advertisements)
        setAds(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando alquileres:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-28"> 
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera Estilo Racing */}
        <header className="mb-12">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Flota de <span className="text-red-700">Alquiler</span>
          </h1>
          <div className="w-24 h-2 bg-red-700 mt-2"></div>
        </header>

        {ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ads.map((ad) => (
              <div 
                key={ad.id} 
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-700 transition-all duration-300 group shadow-xl"
              >
                {/* Contenedor de Imagen */}
                <div className="relative h-56 overflow-hidden bg-zinc-800">
                  {ad.images && ad.images.length > 0 ? (
                    <img 
                      src={ad.images[0]?.image_url} 
                      alt="Vehículo"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 uppercase font-bold">
                      Sin Foto
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-red-700 px-3 py-1 text-xs font-bold uppercase italic">
                    Disponible
                  </div>
                </div>

                {/* Info del Coche */}
                <div className="p-6">
                  <h3 className="text-2xl font-black uppercase italic truncate">
                    {ad.vehicle?.model?.brand?.name} {ad.vehicle?.model?.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl font-black text-white">
                      {Number(ad.price).toLocaleString("es-ES")}€
                    </span>
                    <span className="text-sm text-zinc-500 uppercase font-bold italic">/ día</span>
                  </div>

                  <p className="text-zinc-400 text-sm line-clamp-2 mb-6 h-10">
                    {ad.description || "Sin descripción disponible para este vehículo."}
                  </p>

                  <Link 
                    to={`/alquiler/${ad.id}`}
                    className="block w-full text-center bg-white text-black hover:bg-red-700 hover:text-white py-4 rounded-xl font-black uppercase italic transition-colors duration-300"
                  >
                    Ver disponibilidad
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vacío */
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 text-xl font-bold uppercase italic">
              No hay vehículos disponibles en la flota actualmente
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlquilerScreen;