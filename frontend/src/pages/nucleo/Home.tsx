import { useState } from "react";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
import { useEffect } from "react";
import { Link } from "react-router-dom"

interface Brand {
  id: string;
  name: string;
}

interface Vehiculo {
  id: number;
  name: string;
  brand: Brand;
}

const Home = () => {
  const autoPart = APP_NAME.slice(0, 4);
  const marketPart = APP_NAME.slice(4);

  useEffect(() => {
    handleGetBrands();
    handleGetVehicles();
  }, []);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehiculos, setVehicles] = useState<Vehiculo[]>([]);
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

  const handleGetVehicles = () => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles`)
      .then((res) => {
        setVehicles(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setVehicles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGetVehiclesByBrand = (selectedBrandId: string) => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles/brand/${selectedBrandId}`)
      .then((res) => {
        setVehicles(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setVehicles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {autoPart}<span className="text-red-700">{marketPart}</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Encuentra el vehículo perfecto para ti
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-zinc-800 rounded-2xl p-8 mb-12 border border-zinc-700 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filter by Brand */}
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
                    handleGetVehiclesByBrand(selected);
                  } else {
                    handleGetVehicles();
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

            {/* Get All Button */}
            <div className="flex items-end">
              <button
                onClick={handleGetVehicles}
                className="w-full px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
              >
                Ver todos los vehículos
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
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

          {!loading && !errorMessage && vehiculos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg">No hay vehículos disponibles</p>
            </div>
          )}

          {!loading && vehiculos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiculos.map((v) => (
                <div key={v.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 shadow-lg hover:shadow-xl transition duration-300">
                  <Link to={`/vehicle/${v.id}`} className="mt-6 block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition-colors">
                    Ver detalles
                  </Link>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{v.name}</h3>
                    <span className="text-red-500 font-medium">{v.brand.name}</span>
                  </div>
                  <div className="text-zinc-400">
                    <p>ID: {v.id}</p>
                  </div>
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