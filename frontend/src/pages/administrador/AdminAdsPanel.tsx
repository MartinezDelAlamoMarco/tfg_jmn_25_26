import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, ExternalLink, Pencil, ShoppingBag, Key, List } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- IMPRESCINDIBLE

interface Advertisement {
  id: number;
  brand_name: string;
  model_name: string;
  price: number;
  state_name: string;
  ad_state_id: number;
  is_rent: boolean;
  images: any;
  created_at: string;
}

export default function AdminAdsPanel() {
  const { t } = useTranslation(); // <-- IMPRESCINDIBLE
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "sale" | "rent">("all");
  const token = localStorage.getItem("auth_token");
  const navigate = useNavigate();

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/ads?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(response.data.data || response.data);
    } catch (error) {
      console.error("Error al cargar anuncios", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAds, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredAds = ads.filter(ad => {
    if (filterType === "sale") return !ad.is_rent;
    if (filterType === "rent") return ad.is_rent;
    return true;
  });

  const deleteAd = async (id: number) => {
    if (!confirm(t('admin_panel.delete_confirm', "¿Eliminar este anuncio definitivamente?"))) return; // <-- MODIFICADO CON t()
    try {
      await axios.delete(`${API_BASE_URL}/advertisements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAds();
    } catch (error) {
      alert(t('admin_panel.delete_error', "Error al eliminar el anuncio")); // <-- MODIFICADO CON t()
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder={t('admin_panel.search_placeholder', "Buscar por Marca, Modelo o ID...")} // <-- MODIFICADO CON t()
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500 text-white transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Selector de tipo */}
      <div className="flex gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit">
        <button onClick={() => setFilterType("all")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterType === "all" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}><List size={14} /> {t('admin_panel.all', "Todos")}</button> {/* <-- MODIFICADO CON t() */}
        <button onClick={() => setFilterType("sale")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterType === "sale" ? "bg-green-600 text-white" : "text-zinc-500 hover:text-white"}`}><ShoppingBag size={14} /> {t('admin_panel.sales', "Ventas")}</button> {/* <-- MODIFICADO CON t() */}
        <button onClick={() => setFilterType("rent")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterType === "rent" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"}`}><Key size={14} /> {t('admin_panel.rents', "Alquileres")}</button> {/* <-- MODIFICADO CON t() */}
      </div>

      {/* Tabla de Anuncios */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-black uppercase text-zinc-500">
              <th className="p-5">{t('admin_panel.vehicle', "Vehículo")}</th> {/* <-- MODIFICADO CON t() */}
              <th className="p-5 text-center">{t('admin_panel.type', "Tipo")}</th> {/* <-- MODIFICADO CON t() */}
              <th className="p-5 text-center">{t('admin_panel.state', "Estado")}</th> {/* <-- MODIFICADO CON t() */}
              <th className="p-5">{t('admin_panel.price', "Precio")}</th> {/* <-- MODIFICADO CON t() */}
              <th className="p-5 text-right">{t('admin_panel.actions', "Acciones")}</th> {/* <-- MODIFICADO CON t() */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              /* SPINNER INTEGRADO */
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{t('admin_panel.searching_inventory', "Buscando en Inventario...")}</span> {/* <-- MODIFICADO CON t() */}
                  </div>
                </td>
              </tr>
            ) : filteredAds.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-zinc-500 italic">{t('admin_panel.no_ads_found', "No se han encontrado anuncios.")}</td></tr> // <-- MODIFICADO CON t()
            ) : (
              filteredAds.map(ad => {
                const imagesArray = Array.isArray(ad.images) ? ad.images : JSON.parse((ad.images as any) || "[]");
                const mainImage = imagesArray.find((img: any) => img.is_main)?.image_url || imagesArray[0]?.image_url;
                
                return (
                  <tr key={ad.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                          {mainImage ? <img src={mainImage} alt={ad.model_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-[10px]">N/A</div>}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{ad.brand_name} {ad.model_name}</span>
                          <span className="text-[10px] font-mono text-zinc-600">ID: #{ad.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${ad.is_rent ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'}`}>
                        {ad.is_rent ? <Key size={10}/> : <ShoppingBag size={10}/>} {ad.is_rent ? t('common.rent', 'Alquiler') : t('common.sale', 'Venta')} {/* <-- MODIFICADO CON t() */}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ad.state_name === 'activo' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ad.state_name === 'pendiente' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {ad.state_name}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-white">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(ad.price)}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(ad.is_rent ? `/alquiler/${ad.id}` : `/advertisement/${ad.id}`)} className="p-2.5 bg-zinc-800 hover:bg-white hover:text-black rounded-xl transition-all shadow-lg"><ExternalLink size={16}/></button>
                        <button onClick={() => navigate(`/editar-anuncio/${ad.id}`)} className="p-2.5 bg-zinc-800 hover:bg-yellow-600 hover:text-white rounded-xl transition-all shadow-lg"><Pencil size={16}/></button>
                        <button onClick={() => deleteAd(ad.id)} className="p-2.5 bg-zinc-800 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}