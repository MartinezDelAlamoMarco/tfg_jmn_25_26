import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- IMPRESCINDIBLE

const AdvertisementsScreen = () => {
  const { t } = useTranslation(); // <-- IMPRESCINDIBLE
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Bloqueo de pantalla
  const [activeTab, setActiveTab] = useState<'venta' | 'alquiler'>('venta'); 
  const navigate = useNavigate();

  useEffect(() => { fetchMyAds(); }, []);

  const fetchMyAds = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(`${API_BASE_URL}/my-advertisements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyAds(response.data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('my_ads.delete_confirm', "¿Estás seguro de que quieres eliminar este anuncio?"))) return; // <-- MODIFICADO CON t()
    setActionLoading(true); // Activa el overlay
    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`${API_BASE_URL}/my-advertisements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyAds(myAds.filter((ad: any) => ad.id !== id));
    } catch (error) {
      console.error("Error al eliminar", error);
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const filteredAds = myAds.filter((ad: any) => activeTab === 'venta' ? !ad.is_rent : ad.is_rent);

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white relative">
      {/* OVERLAY DE BLOQUEO DURANTE ELIMINACIÓN */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9999 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-zinc-800 pb-4 gap-4 md:gap-0">
          <div>
            <h1 className="text-3xl font-bold italic uppercase tracking-tighter mb-4">{t('my_ads.my', 'Mis')} <span className="text-red-600">{t('my_ads.vehicles', 'Vehículos')}</span></h1> {/* <-- MODIFICADO CON t() */}
            <div className="flex gap-2 md:gap-4">
              <button onClick={() => setActiveTab('venta')} className={`px-4 md:px-6 py-2 rounded-t-lg font-bold uppercase text-xs md:text-sm transition-colors ${activeTab === 'venta' ? 'bg-red-700 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>{t('common.sale', 'Venta')}</button> {/* <-- MODIFICADO CON t() */}
              <button onClick={() => setActiveTab('alquiler')} className={`px-4 md:px-6 py-2 rounded-t-lg font-bold uppercase text-xs md:text-sm transition-colors ${activeTab === 'alquiler' ? 'bg-red-700 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>{t('common.rent', 'Alquiler')}</button> {/* <-- MODIFICADO CON t() */}
            </div>
          </div>
          <Link to={activeTab === 'venta' ? "/create-ad" : "/create-ad-rent"} className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg font-bold transition mb-2">
            + {t('my_ads.publish_new', 'Publicar nuevo')} {activeTab === 'venta' ? t('my_ads.for_sale', 'en venta') : t('my_ads.for_rent', 'alquiler')} {/* <-- MODIFICADO CON t() */}
          </Link>
        </div>

        {filteredAds.length === 0 ? (
          <div className="bg-zinc-800 p-12 rounded-2xl border border-zinc-700 text-center">
            <p className="text-zinc-500 text-lg mb-4">{t('my_ads.empty_part1', 'Aún no tienes ningún vehículo de')} <span className="font-bold text-white uppercase">{activeTab === 'venta' ? t('common.sale', 'Venta') : t('common.rent', 'Alquiler')}</span> {t('my_ads.empty_part2', 'publicado.')}</p> {/* <-- MODIFICADO CON t() */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad: any) => (
              <div key={ad.id} className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-red-900 transition group relative">
                <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-sm px-3 py-1 rounded border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">{activeTab === 'venta' ? t('my_ads.tag_sale', 'En Venta') : t('my_ads.tag_rent', 'En Alquiler')}</div> {/* <-- MODIFICADO CON t() */}
                <div className="aspect-video bg-zinc-700 relative">
                  {ad.images?.[0] ? (
                    <img src={ad.images[0].image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 italic">{t('common.no_photo', 'Sin foto')}</div> 
                  )}
                  <div className="absolute top-2 right-2 bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded">{ad.state?.name || t('common.active', 'Activo')}</div> {/* <-- MODIFICADO CON t() */}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-1 uppercase truncate">{ad.vehicle?.model?.brand?.name} {ad.vehicle?.model?.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <p className="text-red-500 font-extrabold text-2xl">{Number(ad.price).toLocaleString("es-ES")} €</p>
                    {activeTab === 'alquiler' && <span className="text-zinc-500 text-sm font-bold uppercase italic">{t('common.per_day', '/ día')}</span>} {/* <-- MODIFICADO CON t() */}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/editar-anuncio/${ad.id}`)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg text-sm font-bold transition">{t('common.edit', 'Editar')}</button> {/* <-- MODIFICADO CON t() */}
                    <button onClick={() => handleDelete(ad.id)} className="flex-1 bg-zinc-900 hover:bg-red-950 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-red-500 border border-zinc-700 transition">{t('common.delete', 'Eliminar')}</button> {/* <-- MODIFICADO CON t() */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdvertisementsScreen;