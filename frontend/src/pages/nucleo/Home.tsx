import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
import { Link } from "react-router-dom";

interface Brand {
  id: string;
  name: string;
}

// Interfaz actualizada para coincidir con el modelo Eloquent de Laravel
interface Advertisement {
  id: number;
  price: number;
  description: string;
  views: number;
  ad_state?: { name: string };
  images: { image_url: string; is_main: boolean }[];
  vehicle?: {
    model?: {
      name: string;
      brand?: { name: string };
    };
  };
}

const Home = () => {
  const autoPart = APP_NAME.slice(0, 4);
  const marketPart = APP_NAME.slice(4);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [brandId, setBrandId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleGetBrands();
    handleGetAdvertisements();
  }, []);

  const handleGetBrands = () => {
    axios.get(`${API_BASE_URL}/brands`)
      .then((res) => setBrands(res.data))
      .catch(() => setBrands([]));
  };

  const handleGetAdvertisements = () => {
    setErrorMessage(null);
    setLoading(true);
    axios.get(`${API_BASE_URL}/advertisements`)
      .then((res) => setAdvertisements(res.data))
      .catch(() => setErrorMessage("Error al obtener vehículos"))
      .finally(() => setLoading(false));
  };

  const handleGetAdvertisementsByBrand = (selectedBrandId: string) => {
    setErrorMessage(null);
    setLoading(true);
    axios.get(`${API_BASE_URL}/advertisements/brand/${selectedBrandId}`)
      .then((res) => setAdvertisements(res.data))
      .catch(() => setErrorMessage("Error al obtener vehículos"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {autoPart}<span className="text-red-700">{marketPart}</span>
          </h1>
          <p className="text-xl text-zinc-400">Encuentra el vehículo perfecto</p>
        </div>

        {/* Filtros */}
        <div className="bg-zinc-800 rounded-2xl p-8 mb-12 border border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Filtrar por marca</label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  e.target.value ? handleGetAdvertisementsByBrand(e.target.value) : handleGetAdvertisements();
                }}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Todas las marcas</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleGetAdvertisements} className="w-full px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition">
                Ver todos
              </button>
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((v) => (
            <div key={v.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 flex flex-col hover:shadow-2xl transition">
              <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden border border-zinc-700">
                {v.images && v.images.length > 0 ? (
                  <img
                    src={v.images.find(img => img.is_main)?.image_url || v.images[0].image_url}
                    alt="Vehículo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">Sin foto</div>
                )}
              </div>

              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {v.vehicle?.model?.brand?.name} {v.vehicle?.model?.name}
                </h3>
                <span className="px-2 py-1 text-[10px] bg-red-700/20 text-red-300 rounded-full font-bold uppercase">
                  {v.ad_state?.name}
                </span>
              </div>

              <div className="flex justify-between items-end mb-6">
                <p className="text-3xl font-black">{Number(v.price).toLocaleString("es-ES")} €</p>
                <p className="text-xs text-zinc-500">Vistas: {v.views}</p>
              </div>

              <Link to={`/advertisement/${v.id}`} className="mt-auto block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold">
                Ver detalles
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;