import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);
        // Seleccionamos la imagen principal o la primera
        const img = response.data.images?.find((i:any) => i.is_main)?.image_url || response.data.images?.[0]?.image_url;
        setMainImage(img);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white space-y-6">
      <p className="text-2xl text-red-500 font-bold uppercase">¡Vaya! Error al cargar el vehículo</p>
      <p className="text-zinc-400">Es posible que el anuncio ya no exista o haya un problema de conexión.</p>
      <Link to="/" className="bg-red-700 hover:bg-red-600 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-red-900/20">Volver al catálogo</Link>
    </div>
  );

  if (loading || !advertisement) return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen text-white py-12 px-4 max-w-6xl mx-auto">
      <Link to="/" className="text-zinc-400 hover:text-white mb-8 block transition">← Volver al catálogo</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* GALERÍA DE IMÁGENES */}
        <div className="space-y-4">
          <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl">
            {mainImage ? (
              <img src={mainImage} alt="Coche" className="w-full h-full object-cover animate-fade-in" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 italic">Sin imagen</div>
            )}
          </div>
          {/* Miniaturas */}
          <div className="grid grid-cols-5 gap-2">
            {advertisement.images?.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img.image_url)}
                className={`aspect-square rounded-lg border-2 overflow-hidden transition ${mainImage === img.image_url ? 'border-red-600' : 'border-zinc-700 opacity-50 hover:opacity-100'}`}
              >
                <img src={img.image_url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* FICHA RESUMEN */}
        <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
          <div className="flex justify-between mb-4">
            <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase">{advertisement.state?.name}</span>
            <span className="text-zinc-500 text-sm">Vistas: {advertisement.views}</span>
          </div>

          <h1 className="text-4xl font-black uppercase mb-2">
            {advertisement.vehicle?.model?.brand?.name} {advertisement.vehicle?.model?.name}
          </h1>
          <p className="text-zinc-400 mb-6">📍 {advertisement.province?.name}</p>

          <div className="text-5xl font-black text-white mb-8">
            {Number(advertisement.price).toLocaleString("es-ES")} <span className="text-red-700">€</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600 text-center">
              <p className="text-zinc-500 text-[10px] uppercase font-bold">Km</p>
              <p className="text-xl font-bold">{advertisement.vehicle?.km?.toLocaleString("es-ES")} km</p>
            </div>
            <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600 text-center">
              <p className="text-zinc-500 text-[10px] uppercase font-bold">Año</p>
              <p className="text-xl font-bold">{advertisement.vehicle?.year}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* SECCIÓN DETALLES */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-800 p-8 rounded-2xl border border-zinc-700">
          <h2 className="text-2xl font-bold mb-6 border-b border-zinc-700 pb-2">Descripción</h2>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{advertisement.description}</p>
        </div>
        <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700">
          <h2 className="text-2xl font-bold mb-6 border-b border-zinc-700 pb-2">Especificaciones</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between"><span className="text-zinc-500 font-bold uppercase text-[10px]">Cambio</span><b>{advertisement.vehicle?.transmission?.name}</b></li>
            <li className="flex justify-between"><span className="text-zinc-500 font-bold uppercase text-[10px]">Combustible</span><b>{advertisement.vehicle?.fuel_type?.name}</b></li>
            <li className="flex justify-between"><span className="text-zinc-500 font-bold uppercase text-[10px]">Potencia</span><b>{advertisement.vehicle?.power_hp} CV</b></li>
            <li className="flex justify-between"><span className="text-zinc-500 font-bold uppercase text-[10px]">Puertas</span><b>{advertisement.vehicle?.doors}</b></li>
            <li className="flex justify-between"><span className="text-zinc-500 font-bold uppercase text-[10px]">Color</span><b>{advertisement.vehicle?.tonality?.name}</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;