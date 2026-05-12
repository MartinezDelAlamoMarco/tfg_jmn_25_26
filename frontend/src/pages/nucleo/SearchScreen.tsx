 import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- IMPRESCINDIBLE

const SearchScreen = () => {
  const { t } = useTranslation(); // <-- IMPRESCINDIBLE
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      // Pedimos todos los anuncios (alquiler y venta)
      axios.get(`${API_BASE_URL}/advertisements`)
        .then((res) => {
          const matched = res.data.filter((ad: any) => {
            const searchString = `${ad.brand_name} ${ad.model_name} ${ad.description} ${ad.province_name} ${ad.year}`.toLowerCase();
            return searchString.includes(query);
          });
          setResults(matched);
        })
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="min-h-screen text-white pt-10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('search_screen.results_for', "Resultados para:")} <span className="text-red-500">"{query}"</span></h1> {/* <-- MODIFICADO CON t() */}
        
        {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((v) => {
               let parsedImages = [];
               try { parsedImages = typeof v.images === 'string' ? JSON.parse(v.images) : (v.images || []); } catch(e) {}
               const imageUrl = parsedImages.length > 0 ? parsedImages[0].image_url : null;
               const isRent = v.is_rent === true || v.is_rent === 1 || v.is_rent === "1";

               return (
                <div key={v.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 flex flex-col hover:border-red-700 hover:shadow-2xl transition group relative">
                  
                  {/* CONTENEDOR DE IMAGEN CON POSITION RELATIVE */}
                  <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden relative border border-zinc-700">
                    
                    {/* ETIQUETA ALQUILER / VENTA POSICIONADA DENTRO DE LA IMAGEN */}
                    <div className={`absolute top-2 left-2 z-10 px-3 py-1 rounded text-[10px] font-bold uppercase shadow-lg text-white tracking-widest ${isRent ? 'bg-red-700' : 'bg-black/80 backdrop-blur-sm border border-zinc-700'}`}>
                        {isRent ? t('common.rent', "Alquiler") : t('common.sale', "Venta")} {/* <-- MODIFICADO CON t() */}
                    </div>

                    {imageUrl ? (
                        <img src={imageUrl} alt="Coche" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600 text-xs font-bold uppercase">{t('common.no_photo', "SIN FOTO")}</div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold uppercase truncate">{v.brand_name} {v.model_name}</h3>
                  
                  <div className="flex flex-col gap-1 mb-6 mt-4">
                    <p className="text-xs text-zinc-400">{v.year} • {v.km} km • {v.province_name}</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black">{Number(v.price).toLocaleString("es-ES")} €</p>
                        {isRent && <span className="text-sm text-zinc-500 font-bold uppercase italic"> {t('common.per_day', "/ día")}</span>} {/* <-- MODIFICADO CON t() */}
                    </div>
                  </div>

                  {/* BOTÓN DINÁMICO SEGÚN TIPO DE ANUNCIO */}
                  <Link to={isRent ? `/alquiler/${v.id}` : `/advertisement/${v.id}`} className="block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold uppercase text-sm tracking-widest transition">
                    {isRent ? t('home.view_availability', "Ver disponibilidad") : t('home.view_details', "Ver detalles")} {/* <-- MODIFICADO CON t() */}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-zinc-500 py-20 text-xl">{t('search_screen.no_results', "No se encontraron vehículos que coincidan con tu búsqueda.")}</div>
        )}
      </div>
    </div>
  );
};
export default SearchScreen;