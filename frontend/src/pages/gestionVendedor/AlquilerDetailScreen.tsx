import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import LoadingScreen from "../../components/LoadingScreen";

const AlquilerDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/vehicles/${id}`).then(res => setAd(res.data));
  }, [id]);

  useEffect(() => {
    if (dates.start && dates.end && ad) {
      const diff = Math.ceil(Math.abs(new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 60 * 60 * 24));
      setTotalPrice(diff > 0 ? diff * ad.price : 0);
    }
  }, [dates, ad]);

  if (!ad) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* ... Aquí va todo el diseño de la ficha técnica y el formulario que te pasé antes ... */}
      <div className="max-w-6xl mx-auto">
         <button onClick={() => navigate(-1)} className="text-zinc-500 mb-4 hover:text-white font-bold uppercase text-xs">← Volver al catálogo</button>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna con imagen y motor (Usa el código del mensaje anterior) */}
            {/* Columna con el formulario de reserva (Usa el código del mensaje anterior) */}
         </div>
      </div>
    </div>
  );
};

export default AlquilerDetailScreen;