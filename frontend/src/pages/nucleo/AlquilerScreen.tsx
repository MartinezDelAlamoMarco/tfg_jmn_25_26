import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import LoadingScreen from "../../components/LoadingScreen";

const AlquilerScreen = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/vehicles`) // Ajusta a tu endpoint de anuncios
      .then(res => {
        setAds(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black uppercase italic mb-8">
        Flota de <span className="text-red-700">Alquiler</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad: any) => (
          <div key={ad.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-700 transition group">
            <img 
              src={ad.images[0]?.image_url} 
              className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" 
            />
            <div className="p-6">
              <h3 className="text-xl font-bold uppercase">{ad.vehicle.model.brand.name} {ad.vehicle.model.name}</h3>
              <p className="text-red-600 font-black text-2xl my-2">{ad.price}€ <span className="text-xs text-zinc-500 uppercase">/ día</span></p>
              <Link 
                to={`/alquiler/${ad.id}`}
                className="block w-full text-center bg-zinc-800 hover:bg-red-700 py-3 rounded-xl font-bold uppercase transition"
              >
                Ver disponibilidad
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlquilerScreen;