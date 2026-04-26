import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link } from "react-router-dom";

interface Brand {
  id: string;
  name: string;
}

interface Advertisement {
  id: number;
  price: number;
  description: string;
  views: number;
  is_rent: boolean; // <-- Añadimos el booleano al modelo
  state?: { name: string };
  images: { image_url: string; is_main: boolean }[];
  vehicle?: {
    model?: {
      name: string;
      brand?: { name: string };
    };
  };
}

const AlquilerScreen = () => {
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
      .then((res) => {
        // FILTRO CLAVE: Guardamos solo los anuncios que son de alquiler
        const rentals = res.data.filter((ad: Advertisement) => ad.is_rent);
        setAdvertisements(rentals);
      })
      .catch(() => setErrorMessage("Error al obtener la flota de alquiler"))
      .finally(() => setLoading(false));
  };

  const handleGetAdvertisementsByBrand = (selectedBrandId: string) => {
    setErrorMessage(null);
    setLoading(true);
    axios.get(`${API_BASE_URL}/advertisements/brand/${selectedBrandId}`)
      .then((res) => {
        // FILTRO CLAVE: Mismo filtro al buscar por marca
        const rentals = res.data.filter((ad: Advertisement) => ad.is_rent);
        setAdvertisements(rentals);
      })
      .catch(() => setErrorMessage("Error al obtener la flota de alquiler"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Cabecera */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase italic tracking-tighter">
            Flota de <span className="text-red-700">Alquiler</span>
          </h1>
          <p className="text-xl text-zinc-400">Encuentra el vehículo perfecto para tus viajes</p>
        </div>

        {/* Filtros */}
        <div className="bg-zinc-800 rounded-2xl p-8 mb-12 border border-zinc-700 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Filtrar por marca</label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  e.target.value ? handleGetAdvertisementsByBrand(e.target.value) : handleGetAdvertisements();
                }}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 transition outline-none"
              >
                <option value="">Todas las marcas</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setBrandId("");
                  handleGetAdvertisements();
                }} 
                className="w-full px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition"
              >
                Ver todos
              </button>
            </div>
          </div>
        </div>

        {/* Listado de Vehículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
          ) : errorMessage ? (
            <div className="col-span-full bg-red-900/20 border border-red-700 p-4 rounded-xl text-red-400 text-center font-bold">
              {errorMessage}
            </div>
          ) : advertisements.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-zinc-500 text-xl font-bold uppercase italic">
                No hay vehículos de alquiler disponibles actualmente
              </p>
            </div>
          ) : (
            advertisements.map((v) => (
              <div key={v.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 flex flex-col hover:shadow-2xl hover:border-red-700 transition duration-300 group">
                
                {/* Imagen */}
                <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden border border-zinc-700 relative">
                  {v.images && v.images.length > 0 ? (
                    <img
                      src={v.images.find(img => img.is_main)?.image_url || v.images[0].image_url}
                      alt="Coche"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 uppercase font-bold text-sm">Sin foto</div>
                  )}
                  {/* Etiqueta de estado en alquiler */}
                  <div className="absolute top-2 left-2 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded shadow-lg uppercase tracking-widest">
                    Alquiler
                  </div>
                </div>

                {/* Título y Estado */}
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-xl font-bold uppercase truncate">
                    {v.vehicle?.model?.brand?.name} {v.vehicle?.model?.name}
                  </h3>
                  <span className="px-2 py-1 text-[10px] bg-red-700/20 text-red-300 rounded-full font-bold uppercase whitespace-nowrap">
                    {v.state?.name || 'Disponible'}
                  </span>
                </div>

                {/* Precio y Vistas */}
                <div className="flex justify-between items-end mb-6 mt-auto">
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-white">{Number(v.price).toLocaleString("es-ES")} €</p>
                    <p className="text-sm text-zinc-500 font-bold uppercase italic">/ día</p>
                  </div>
                  <p className="text-xs text-zinc-500">Vistas: {v.views}</p>
                </div>

                {/* Botón (Asegúrate de que la ruta coincida con el componente de detalle de alquiler) */}
                <Link 
                  to={`/alquiler/${v.id}`} 
                  className="block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition uppercase tracking-widest text-sm"
                >
                  Ver disponibilidad
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AlquilerScreen;