import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
import { Link } from "react-router-dom";

interface Brand {
  id: string;
  name: string;
}

// Nueva interfaz plana a juego con la Base de Datos
interface Advertisement {
  id: number;
  price: number;
  description: string;
  views: number;
  state_name: string;
  images: { image_url: string; is_main: boolean }[];
  model_name: string;
  brand_name: string;
}

const Home = () => {
  const autoPart = APP_NAME.slice(0, 4);
  const marketPart = APP_NAME.slice(4);

  useEffect(() => {
    handleGetBrands();
    handleGetAdvertisements();
  }, []);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [brandId, setBrandId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetBrands = () => {
    setErrorMessage(null);
    axios
      .get(`${API_BASE_URL}/brands`)
      .then((res) => {
        setBrands(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener las marcas");
        setBrands([]);
      });
  };

  const handleGetAdvertisements = () => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/advertisements`)
      .then((res) => {
        setAdvertisements(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setAdvertisements([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGetAdvertisementsByBrand = (selectedBrandId: string) => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/advertisements/brand/${selectedBrandId}`)
      .then((res) => {
        setAdvertisements(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setAdvertisements([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {autoPart}
            <span className="text-red-700">{marketPart}</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Encuentra el vehículo perfecto para ti
          </p>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-8 mb-12 border border-zinc-700 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Filtrar por marca
              </label>
              <select
                value={brandId}
                onChange={(e) => {
                  const selected = e.target.value;
                  setBrandId(selected);
                  if (selected) {
                    handleGetAdvertisementsByBrand(selected);
                  } else {
                    handleGetAdvertisements();
                  }
                }}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
              >
                <option value="">Todas las marcas</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGetAdvertisements}
                className="w-full px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
              >
                Ver todos los vehículos
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-8">Vehículos</h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-8">
              <p className="text-red-300">{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && advertisements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg">
                No hay vehículos disponibles
              </p>
            </div>
          )}

          {!loading && advertisements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advertisements.map((v) => (
                <div
                  key={v.id}
                  className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 shadow-lg hover:shadow-xl transition duration-300 flex flex-col"
                >
                  <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden border border-zinc-700">
                    {v.images && v.images.length > 0 ? (
                      <img
                        src={v.images[0].image_url}
                        alt="Coche"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        Sin foto
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {/* Aquí usamos las variables planas correctas */}
                      <h3 className="text-xl font-semibold text-white">
                        {`${v.brand_name || "Marca"} ${v.model_name || ""}`}
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                        {v.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-red-700/20 text-red-300">
                      {v.state_name || 'Sin Estado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-3xl font-extrabold text-white">
                        {Number(v.price).toLocaleString("es-ES")} €
                      </p>
                      <p className="text-xs text-zinc-500">Vistas: {v.views}</p>
                    </div>
                    <p className="text-sm text-zinc-400">ID: {v.id}</p>
                  </div>

                  <Link
                    to={`/advertisement/${v.id}`}
                    className="mt-auto block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;