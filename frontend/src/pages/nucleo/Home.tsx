import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
import { Link } from "react-router-dom";

interface Brand { id: string; name: string; }
interface Advertisement {
  id: number; price: number; description: string; views: number; is_rent: boolean;
  state_name?: string; 
  brand_name?: string;
  model_name?: string;
  images: any; // Acepta Array o String de la Vista SQL
}

const Home = () => {
  const autoPart = APP_NAME.slice(0, 4);
  const marketPart = APP_NAME.slice(4);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [brandId, setBrandId] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    handleGetBrands();
    handleGetAdvertisements();
    // Si estamos autenticados, cargamos los ids favoritos del usuario
    if (localStorage.getItem('auth_token')) {
      axios.get(`${API_BASE_URL}/favorites`)
        .then((res) => {
          const ids = (res.data || []).map((a: any) => a.id);
          setFavoriteIds(ids);
        })
        .catch(() => {
          // Ignoramos errores aquí; no bloquea la carga de anuncios
        });
    }
  }, []);

  const handleGetBrands = () => {
    axios.get(`${API_BASE_URL}/brands`).then((res) => setBrands(res.data)).catch(() => setBrands([]));
  };

  const handleGetAdvertisements = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/advertisements`)
      .then((res) => {
        const ventas = res.data.filter((ad: any) => !ad.is_rent || ad.is_rent === 0 || ad.is_rent === "0");
        setAdvertisements(ventas);
      })
      .finally(() => setLoading(false));
  };

  const handleGetAdvertisementsByBrand = (selectedBrandId: string) => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/advertisements/brand/${selectedBrandId}`)
      .then((res) => {
        const ventas = res.data.filter((ad: any) => !ad.is_rent || ad.is_rent === 0 || ad.is_rent === "0");
        setAdvertisements(ventas);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {autoPart}<span className="text-red-700">{marketPart}</span>
          </h1>
          <p className="text-xl text-zinc-400">Encuentra el vehículo perfecto para comprar</p>
        </div>

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
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Todas las marcas</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setBrandId(""); handleGetAdvertisements(); }} className="w-full px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold">Ver todos</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((v) => {
             // PARSEO DE IMÁGENES ULTRA SEGURO
             let parsedImages = [];
             if (typeof v.images === 'string') {
                 try { parsedImages = JSON.parse(v.images); } catch(e) { parsedImages = []; }
             } else {
                 parsedImages = v.images || [];
             }
             const imageUrl = parsedImages.length > 0 ? parsedImages[0].image_url : null;

             return (
              <div key={v.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 flex flex-col hover:shadow-2xl transition group relative">
                <div className="absolute top-8 left-8 z-10 bg-black/80 backdrop-blur-sm px-3 py-1 rounded border border-zinc-700 text-[10px] font-bold uppercase tracking-widest shadow-lg text-white">Venta</div>
                <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden border border-zinc-700 relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Coche" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 uppercase font-bold text-sm">Sin foto</div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-xl font-bold uppercase truncate">
                    {v.brand_name} {v.model_name}
                  </h3>
                  <span className="px-2 py-1 text-[10px] bg-red-700/20 text-red-300 rounded-full font-bold uppercase whitespace-nowrap">
                    {v.state_name || 'Disponible'}
                  </span>
                </div>
                <div className="flex justify-between items-end mb-6 mt-auto">
                  <p className="text-3xl font-black">{Number(v.price).toLocaleString("es-ES")} €</p>
                  <p className="text-xs text-zinc-500">Vistas: {v.views}</p>
                </div>
                <Link to={`/advertisement/${v.id}`} className="block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition uppercase tracking-widest text-sm">Ver detalles</Link>
              </div>

              <Link to={`/advertisement/${v.id}`} className="mt-auto block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition">
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