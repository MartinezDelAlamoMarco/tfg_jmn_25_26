import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import LoadingScreen from "../../components/LoadingScreen";

const CreateAd = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true); 
  const [loading, setLoading] = useState(false);
  
  // Estados para datos de la BD
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [tonalities, setTonalities] = useState([]);
  
  // --- CAMBIO 1: Arrays para manejar múltiples fotos ---
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
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

  // CARGA DE DATOS INICIALES
  useEffect(() => {
    const fetchAllData = async () => {
      setPageLoading(true);
      try {
        const [resB, resP, resF, resT, resTon] = await Promise.all([
          axios.get(`${API_BASE_URL}/brands`),
          axios.get(`${API_BASE_URL}/provinces`),
          axios.get(`${API_BASE_URL}/fuel-types`),
          axios.get(`${API_BASE_URL}/transmissions`),
          axios.get(`${API_BASE_URL}/tonalities`)
        ]);
        
        setBrands(resB.data || []);
        setProvinces(resP.data || []);
        setFuelTypes(resF.data || []);
        setTransmissions(resT.data || []);
        setTonalities(resTon.data || []);
      } catch (error) {
        console.error("Error cargando catálogos", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (pageLoading) {
    return <LoadingScreen message="Preparando el formulario de venta..." />;
  }

  // --- CAMBIO 2: Lógica para múltiples archivos ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Límite opcional de 5 fotos
      if (selectedFiles.length + newFiles.length > 5) {
        alert("Puedes subir un máximo de 5 fotos.");
        return;
      }

      // Añadimos las nuevas fotos a las que ya hubiera
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Generamos las previsualizaciones
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Función para eliminar una foto específica de la selección
  const removeImage = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleBrandChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    setFormData({ ...formData, vehicle_brand_id: brandId, vehicle_model_id: '' });
    
    if (brandId) {
      try {
        const res = await axios.get(`${API_BASE_URL}/brands/${brandId}/models`);
        setModels(res.data || []);
      } catch (error) {
        console.error("Error cargando modelos", error);
      }
    } else {
      setModels([]);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!/^[0-9]*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
    
    // --- CAMBIO 3: Bucle para enviar todas las fotos a Laravel ---
    selectedFiles.forEach((file) => {
      dataToSend.append('images[]', file);
    });

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_BASE_URL}/my-advertisements`, dataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });
      navigate('/mis-anuncios');
    } catch (error) {
      console.error(error);
      alert('Error al publicar. Revisa los campos y tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">
          Vender <span className="text-red-600">Vehículo</span>
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
              <input type="text" name="year" value={formData.year} onChange={handleNumericChange} placeholder="Año (Ej: 2021)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-600 outline-none" />
              <input type="text" name="hp" value={formData.hp} onChange={handleNumericChange} placeholder="Potencia (CV)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-600 outline-none" />
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

          {/* --- CAMBIO 4: UI de la Galería de Fotos --- */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">Fotografías</h2>
              <span className="text-xs text-zinc-400">{selectedFiles.length} / 5</span>
            </div>
            
            <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 bg-zinc-900/40 min-h-200px flex flex-col justify-center">
              {previews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Foto ${index + 1}`} className="rounded-xl object-cover w-full h-32 shadow-2xl border border-zinc-700" />
                      
                      {/* Botón de borrar foto */}
                      <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 rounded-full w-7 h-7 font-bold border-2 border-zinc-800 flex items-center justify-center hover:bg-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10">
                        ✕
                      </button>
                      
                      {/* Etiqueta de foto principal */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold border border-zinc-700">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Botón para añadir más fotos si hay menos de 5 */}
                  {selectedFiles.length < 5 && (
                    <label className="cursor-pointer border-2 border-dashed border-zinc-600 rounded-xl flex flex-col items-center justify-center h-32 hover:bg-zinc-800 transition group">
                      <span className="text-3xl text-zinc-500 group-hover:text-white transition-colors">+</span>
                      <span className="text-xs text-zinc-500 group-hover:text-white transition-colors mt-1">Añadir más</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer text-zinc-500 hover:text-white transition group flex flex-col items-center justify-center w-full h-full">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📷</span>
                  <span className="text-lg font-medium">Subir fotos del coche</span>
                  <span className="text-sm mt-1 opacity-70">Puedes seleccionar hasta 5 imágenes (JPG, PNG)</span>
                  {/* El atributo 'multiple' permite seleccionar varias a la vez */}
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </label>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">Detalles del Anuncio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Título (Ej: BMW M4 Competition impecable...)" className="md:col-span-2 bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600" />
              <input type="text" name="price" value={formData.price} onChange={handleNumericChange} placeholder="Precio (€)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none text-red-500 font-bold focus:ring-2 focus:ring-red-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="mileage" value={formData.mileage} onChange={handleNumericChange} placeholder="Kilometraje (Km)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600" />
              <select name="province_id" required value={formData.province_id} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">Provincia</option>
                {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <textarea name="description" rows={4} required value={formData.description} onChange={handleChange} placeholder="Describe el estado del vehículo, extras, mantenimientos..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-red-600" />
          </section>

          <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/30 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Arrancando Motor...
              </>
            ) : 'Publicar Anuncio'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAd;