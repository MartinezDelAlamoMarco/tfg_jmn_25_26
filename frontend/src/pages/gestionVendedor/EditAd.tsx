import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import LoadingScreen from '../../components/LoadingScreen';

const EditAd = () => {
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

  // ELIMINADO: 'title'
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    province_id: '',
    vehicle_brand_id: '',
    vehicle_model_id: '',
    fuel_type_id: '',
    transmission_id: '',
    tonality_id: '',
    year: '',
    mileage: '',
    hp: '',
    doors: '5'
  });

  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  useEffect(() => {
    const fetchAllDataAndAd = async () => {
      setPageLoading(true);
      try {
        const token = localStorage.getItem('auth_token');

        const [resB, resP, resF, resT, resTon, resAd] = await Promise.all([
          axios.get(`${API_BASE_URL}/brands`),
          axios.get(`${API_BASE_URL}/provinces`),
          axios.get(`${API_BASE_URL}/fuel-types`),
          axios.get(`${API_BASE_URL}/transmissions`),
          axios.get(`${API_BASE_URL}/tonalities`),
          axios.get(`${API_BASE_URL}/my-advertisements/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setBrands(resB.data || []);
        setProvinces(resP.data || []);
        setFuelTypes(resF.data || []);
        setTransmissions(resT.data || []);
        setTonalities(resTon.data || []);

        const ad = resAd.data;
        
        if (ad && ad.vehicle && ad.vehicle.model) {
          setFormData({
            description: ad.description || '',
            price: ad.price || '',
            province_id: ad.province_id || '',
            vehicle_brand_id: ad.vehicle.model.brand_id || '',
            vehicle_model_id: ad.vehicle.model_id || '',
            fuel_type_id: ad.vehicle.fuel_type_id || '',
            transmission_id: ad.vehicle.transmission_id || '',
            tonality_id: ad.vehicle.tonality_id || '',
            year: ad.vehicle.year || '',
            mileage: ad.vehicle.km || '', 
            hp: ad.vehicle.power_hp || '', 
            doors: ad.vehicle.doors ? ad.vehicle.doors.toString() : '5'
          });

          const resM = await axios.get(`${API_BASE_URL}/brands/${ad.vehicle.model.brand_id}/models`);
          setModels(resM.data || []);
        }
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchAllDataAndAd();
  }, [id]);

  const handleBrandChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    setFormData({ ...formData, vehicle_brand_id: brandId, vehicle_model_id: '' });
    if (brandId) {
      try {
        const res = await axios.get(`${API_BASE_URL}/brands/${brandId}/models`);
        setModels(res.data || []);
      } catch (error) { console.error(error); }
    } else { setModels([]); }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_BASE_URL}/my-advertisements/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/mis-anuncios');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el anuncio.');
    } finally { setSubmitLoading(false); }
  };

  if (pageLoading) {
    return <LoadingScreen message="Obteniendo información del vehículo..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">
          Editar <span className="text-red-600">Vehículo</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-800 p-6 md:p-10 rounded-3xl border border-zinc-700 shadow-2xl">
          <section className="space-y-6">
            <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">Datos Técnicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select name="vehicle_brand_id" required value={formData.vehicle_brand_id} onChange={handleBrandChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600 transition">
                <option value="">Marca</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select name="vehicle_model_id" required value={formData.vehicle_model_id} onChange={handleChange} disabled={!formData.vehicle_brand_id} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none disabled:opacity-30 focus:ring-2 focus:ring-red-600 transition">
                <option value="">Modelo</option>
                {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select name="fuel_type_id" required value={formData.fuel_type_id} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">Combustible</option>
                {fuelTypes.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select name="transmission_id" required value={formData.transmission_id} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">Cambio</option>
                {transmissions.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="Año" className={`bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-600 outline-none ${noArrowsClass}`} />
              <input type="number" name="hp" value={formData.hp} onChange={handleChange} placeholder="CV" className={`bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-600 outline-none ${noArrowsClass}`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select name="tonality_id" required value={formData.tonality_id} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">Color / Tonalidad</option>
                {tonalities.map((ton: any) => <option key={ton.id} value={ton.id}>{ton.name}</option>)}
              </select>
              <select name="doors" value={formData.doors} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="2">2 Puertas</option>
                <option value="3">3 Puertas</option>
                <option value="4">4 Puertas</option>
                <option value="5">5 Puertas</option>
              </select>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">Detalles Comerciales</h2>
            
            {/* ELIMINADO EL CAMPO TÍTULO AQUÍ TAMBIÉN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Precio" className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-8 outline-none text-red-500 font-bold focus:ring-2 focus:ring-red-600 ${noArrowsClass}`} />
                <span className="absolute left-3 top-3 text-red-700 font-bold">€</span>
              </div>
              <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="Kilometraje (Km)" className={`bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600 ${noArrowsClass}`} />
              <select name="province_id" required value={formData.province_id} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">Provincia</option>
                {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <textarea name="description" rows={4} required value={formData.description} onChange={handleChange} placeholder="Descripción..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-red-600" />
          </section>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/mis-anuncios')} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-5 rounded-2xl font-black uppercase tracking-widest transition">
              Cancelar
            </button>
            <button type="submit" disabled={submitLoading} className="flex-2 bg-red-700 hover:bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-red-900/30 active:scale-95 disabled:opacity-50 px-8">
              {submitLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAd;