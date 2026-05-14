import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

const EditAd = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [tonalities, setTonalities] = useState([]);
  const [formData, setFormData] = useState({
    description: '', price: '', province_id: '', vehicle_brand_id: '', vehicle_model_id: '',
    fuel_type_id: '', transmission_id: '', tonality_id: '', year: '', mileage: '', hp: '', doors: '5'
  });

  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  useEffect(() => {
    const fetchAllDataAndAd = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const [resB, resP, resF, resT, resTon, resAd] = await Promise.all([
          axios.get(`${API_BASE_URL}/brands`), axios.get(`${API_BASE_URL}/provinces`),
          axios.get(`${API_BASE_URL}/fuel-types`), axios.get(`${API_BASE_URL}/transmissions`),
          axios.get(`${API_BASE_URL}/tonalities`),
          axios.get(`${API_BASE_URL}/my-advertisements/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBrands(resB.data || []); setProvinces(resP.data || []); setFuelTypes(resF.data || []);
        setTransmissions(resT.data || []); setTonalities(resTon.data || []);
        const ad = resAd.data;
        if (ad && ad.vehicle && ad.vehicle.model) {
          setFormData({
            description: ad.description || '', price: ad.price || '', province_id: ad.province_id || '',
            vehicle_brand_id: ad.vehicle.model.brand_id || '', vehicle_model_id: ad.vehicle.model_id || '',
            fuel_type_id: ad.vehicle.fuel_type_id || '', transmission_id: ad.vehicle.transmission_id || '',
            tonality_id: ad.vehicle.tonality_id || '', year: ad.vehicle.year || '',
            mileage: ad.vehicle.km || '', hp: ad.vehicle.power_hp || '', doors: ad.vehicle.doors ? ad.vehicle.doors.toString() : '5'
          });
          const resM = await axios.get(`${API_BASE_URL}/brands/${ad.vehicle.model.brand_id}/models`);
          setModels(resM.data || []);
        }
      } catch (error) {
          console.error(error);
          alert(t('edit_ad.error_loading', "Error cargando el anuncio"));
      } finally { setPageLoading(false); }
    };
    fetchAllDataAndAd();
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_BASE_URL}/my-advertisements/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/mis-anuncios');
    } catch (error) {
        console.error(error);
        alert(t('edit_ad.error_updating', "Error al actualizar el anuncio."));
    } finally { setSubmitLoading(false); }
  };

  const handleBrandChange = async (e: any) => {
    const brandId = e.target.value;
    setFormData({ ...formData, vehicle_brand_id: brandId, vehicle_model_id: '' });
    if (brandId) {
      const res = await axios.get(`${API_BASE_URL}/brands/${brandId}/models`);
      setModels(res.data || []);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 relative">
      {submitLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9999 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mb-4"></div>
          <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse">{t('edit_ad.updating', 'Actualizando...')}</p>
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">
            {t('edit_ad.edit', 'Editar')} <span className="text-red-600">{t('edit_ad.vehicle', 'Vehículo')}</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-800 p-6 md:p-10 rounded-3xl border border-zinc-700 shadow-2xl">
          <section className="space-y-6">
            <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">{t('edit_ad.technical_data', 'Datos Técnicos')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select name="vehicle_brand_id" required value={formData.vehicle_brand_id} onChange={handleBrandChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600 transition">
                <option value="">{t('filters.brand', 'Marca')}</option>{brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select name="vehicle_model_id" required value={formData.vehicle_model_id} onChange={(e) => setFormData({...formData, vehicle_model_id: e.target.value})} disabled={!formData.vehicle_brand_id} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none disabled:opacity-30 focus:ring-2 focus:ring-red-600 transition">
                <option value="">{t('filters.model', 'Modelo')}</option>{models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select name="fuel_type_id" value={formData.fuel_type_id} onChange={(e) => setFormData({...formData, fuel_type_id: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">{t('common.fuel', 'Combustible')}</option>{fuelTypes.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select name="transmission_id" value={formData.transmission_id} onChange={(e) => setFormData({...formData, transmission_id: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">{t('common.transmission', 'Transmisión')}</option>{transmissions.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="number" name="year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder={t('common.year', 'Año')} className={`bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-600 outline-none ${noArrowsClass}`} />
              <input type="number" name="hp" value={formData.hp} onChange={(e) => setFormData({...formData, hp: e.target.value})} placeholder={t('edit_ad.hp', 'CV')} className={`bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-600 outline-none ${noArrowsClass}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="tonality_id" value={formData.tonality_id} onChange={(e) => setFormData({...formData, tonality_id: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">{t('common.color', 'Color')}</option>{tonalities.map((ton: any) => <option key={ton.id} value={ton.id}>{ton.name}</option>)}
              </select>
              <select name="doors" value={formData.doors} onChange={(e) => setFormData({...formData, doors: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="2">{t('filters.doors_2', '2 Puertas')}</option><option value="3">{t('filters.doors_3', '3 Puertas')}</option><option value="4">{t('filters.doors_4', '4 Puertas')}</option><option value="5">{t('filters.doors_5', '5 Puertas')}</option>
              </select>
            </div>
          </section>
          <section className="space-y-6">
            <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">{t('edit_ad.commercial_details', 'Detalles Comerciales')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input type="number" name="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder={t('common.price', 'Precio')} className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-8 outline-none text-red-500 font-bold focus:ring-2 focus:ring-red-600 ${noArrowsClass}`} />
                <span className="absolute left-3 top-3 text-red-700 font-bold">€</span>
              </div>
              <input type="number" name="mileage" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} placeholder={t('common.km', 'Km')} className={`bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600 ${noArrowsClass}`} />
              <select name="province_id" value={formData.province_id} onChange={(e) => setFormData({...formData, province_id: e.target.value})} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">{t('filters.province', 'Provincia')}</option>{provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <textarea 
                name="description" 
                rows={4} 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder={t('create_ad.description_placeholder', "Describe el estado del vehículo...")}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-red-600" 
            />
          </section>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/mis-anuncios')} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-5 rounded-2xl font-black uppercase tracking-widest transition">
                {t('common.cancel', 'Cancelar')}
            </button>
            <button type="submit" disabled={submitLoading} className="flex-2 bg-red-700 hover:bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-red-900/30 active:scale-95 disabled:opacity-50 px-8">
                {t('edit_ad.submit', 'Actualizar Anuncio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditAd;