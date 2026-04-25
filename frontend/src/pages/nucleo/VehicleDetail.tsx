import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";

// Interfaz actualizada para el modelo de datos real de Laravel
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);
        
        // Seleccionamos la imagen principal o la primera disponible
        const img = response.data.images?.find((i: any) => i.is_main)?.image_url 
                 || response.data.images?.[0]?.image_url;
        setMainImage(img || "");
      } catch (err) {
        console.error("Error al cargar el vehículo:", err);
        setError("No se pudo cargar la información del vehículo.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

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
          {/* SECCIÓN DE IMÁGENES */}
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
            
            {/* Galería de miniaturas */}
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

          {/* INFORMACIÓN DEL ANUNCIO */}
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

              {/* Especificaciones rápidas */}
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

              <button className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-lg shadow-red-900/20 active:scale-95">
                Contactar con el vendedor
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN Y FICHA TÉCNICA */}
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