import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";

interface Advertisement {
  id: number;
  price: string;
  description: string;
  views: number;
  state: { name: string };
  province: { name: string };
  images: { image_url: string; is_main: boolean }[];
  vehicle: {
    km: number;
    year: number;
    power_hp: number;
    doors: number;
    fuel_type: { name: string }; // <--- Antes fuelType
    transmission: { name: string };
    tonality: { name: string };
    model: {
      name: string;
      brand: { name: string };
    };
  };
}

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
        setAdvertisement(response.data);
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
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (error || !advertisement) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white">
        <p className="text-xl mb-4">{error || "Vehículo no encontrado"}</p>
        <Link to="/" className="text-red-700 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Usamos el Optional Chaining (?.) para evitar que la pantalla se quede en negro
  const car = advertisement?.vehicle;

  return (
    <div className="min-h-screen text-white py-12 px-4 sm:px-6 lg:px-8">
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
              {advertisement.images && advertisement.images.length > 0 ? (
                <img
                  src={advertisement.images[0].image_url}
                  alt="Coche"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-zinc-500 italic text-lg">
                  Imagen del vehículo
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-800 rounded-lg border border-zinc-700 opacity-50 flex items-center justify-center"
                >
                  <span className="text-xs text-zinc-600">Foto {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  {advertisement?.state?.name || "Estado"}
                </span>
                <span className="text-zinc-500 text-sm">
                  Vistas: {advertisement?.views}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight">
                {car?.model?.brand?.name} {car?.model?.name}
              </h1>
              <p className="text-zinc-400 text-lg mb-6 flex items-center">
                <span className="mr-2">📍</span>{" "}
                {advertisement?.province?.name || "Ubicación"}
              </p>

              <div className="text-5xl font-extrabold text-white mb-8">
                {Number(advertisement?.price).toLocaleString("es-ES")}{" "}
                <span className="text-red-700">€</span>
              </div>

              {/* CUADROS TÉCNICOS CORREGIDOS CON ?. Y snake_case */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-xs uppercase font-bold">
                    Kilómetros
                  </p>
                  <p className="text-xl">
                    {car?.km?.toLocaleString("es-ES") || 0} km
                  </p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-xs uppercase font-bold">
                    Año
                  </p>
                  <p className="text-xl">{car?.year || "-"}</p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-xs uppercase font-bold">
                    Combustible
                  </p>
                  <p className="text-xl">{car?.fuel_type?.name || "N/A"}</p>
                </div>
                <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-600">
                  <p className="text-zinc-500 text-xs uppercase font-bold">
                    Potencia
                  </p>
                  <p className="text-xl">{car?.power_hp || 0} CV</p>
                </div>
              </div>

              <button className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition duration-300 shadow-lg shadow-red-900/20">
                Contactar con el vendedor
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 border-b border-zinc-700 pb-2">
              Descripción
            </h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
              {advertisement?.description}
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 border-b border-zinc-700 pb-2">
              Ficha Técnica
            </h2>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-zinc-500">Transmisión</span>{" "}
                <span className="font-semibold">
                  {car?.transmission?.name || "N/A"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-500">Puertas</span>{" "}
                <span className="font-semibold">{car?.doors || "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-500">Color</span>{" "}
                <span className="font-semibold">
                  {car?.tonality?.name || "N/A"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-500">Ubicación</span>{" "}
                <span className="font-semibold">
                  {advertisement?.province?.name || "N/A"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
