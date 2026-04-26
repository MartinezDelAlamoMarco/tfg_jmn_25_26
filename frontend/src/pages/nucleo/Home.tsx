import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
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
  state: { name: string };
  images: { image_url: string }[];
  vehicle: {
    model: {
      name: string;
      brand: Brand;
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
    axios
      .get(`${API_BASE_URL}/brands`)
      .then((res) => {
        setBrands(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar marcas", err);
      });
  };

  const handleGetAdvertisements = (selectedBrandId = "") => {
    setLoading(true);
    setErrorMessage(null);
    
    // Si hay marca seleccionada, filtramos, si no, traemos todos
    const url = selectedBrandId 
      ? `${API_BASE_URL}/vehicles?brand_id=${selectedBrandId}` 
      : `${API_BASE_URL}/vehicles`;

    axios
      .get(url)
      .then((res) => {
        setAdvertisements(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage("No se han podido cargar los anuncios.");
        setLoading(false);
      });
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setBrandId(id);
    handleGetAdvertisements(id);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER SUPERIOR */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        
        {/* BOTÓN ALQUILAR (Superior Izquierda) */}
        <Link
          to="/alquiler"
          className="bg-red-700 hover:bg-red-600 text-white px-8 py-2.5 rounded-lg font-black uppercase tracking-tighter transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-900/20"
        >
          Alquilar
        </Link>

        {/* LOGO DINÁMICO */}
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">
          <span className="text-red-700">{autoPart}</span>
          <span className="text-white">{marketPart}</span>
        </h1>
        
        {/* Espaciador para equilibrio visual en desktop */}
        <div className="w-[120px] hidden md:block"></div> 
      </div>

      {/* SECCIÓN HERO / BUSCADOR */}
      <div className="relative py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black uppercase italic mb-8 tracking-tighter">
            Encuentra tu <span className="text-red-700">Bestia</span>
          </h2>
          
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm">
            <select
              value={brandId}
              onChange={handleBrandChange}
              className="w-full bg-zinc-800 text-white p-4 rounded-xl border border-zinc-700 outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold uppercase"
            >
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: LISTADO DE ANUNCIOS */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-4">
          <h3 className="text-2xl font-black uppercase italic tracking-widest">
            Anuncios <span className="text-red-700">Destacados</span>
          </h3>
          <p className="text-zinc-500 font-bold">{advertisements.length} resultados</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : errorMessage ? (
          <p className="text-center text-red-500 font-bold">{errorMessage}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advertisements.map((v) => (
              <div
                key={v.id}
                className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-700/50 transition-all duration-300 flex flex-col shadow-2xl"
              >
                {/* Imagen */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={v.images[0]?.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt="Vehículo"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 text-xs font-black uppercase bg-red-700 text-white rounded-md italic">
                      {v?.state?.name || 'Stock'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black uppercase italic leading-none">
                        {v?.vehicle?.model?.brand?.name}
                      </h3>
                      <p className="text-zinc-400 font-bold text-lg leading-none mt-1">
                        {v?.vehicle?.model?.name}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-red-600 italic">
                      {Number(v.price).toLocaleString("es-ES")}€
                    </p>
                  </div>

                  <p className="text-sm text-zinc-500 mb-6 line-clamp-2 italic">
                    {v.description}
                  </p>

                  <Link
                    to={`/advertisement/${v.id}`}
                    className="mt-auto block w-full text-center py-4 bg-zinc-800 group-hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-tighter transition-colors duration-300"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
