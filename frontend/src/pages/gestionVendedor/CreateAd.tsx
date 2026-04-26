import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import LoadingScreen from "../../components/LoadingScreen";
import imageCompression from "browser-image-compression";

const CreateAd = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [tonalities, setTonalities] = useState([]);

  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ELIMINADO: 'title'
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    province_id: "",
    vehicle_brand_id: "",
    vehicle_model_id: "",
    fuel_type_id: "",
    transmission_id: "",
    tonality_id: "",
    year: "",
    mileage: "",
    hp: "",
    doors: "5",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setPageLoading(true);
      try {
        const [resB, resP, resF, resT, resTon] = await Promise.all([
          axios.get(`${API_BASE_URL}/brands`),
          axios.get(`${API_BASE_URL}/provinces`),
          axios.get(`${API_BASE_URL}/fuel-types`),
          axios.get(`${API_BASE_URL}/transmissions`),
          axios.get(`${API_BASE_URL}/tonalities`),
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const originalFiles = Array.from(e.target.files);
      const options = {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFiles = await Promise.all(
          originalFiles.map(async (file) => {
            return await imageCompression(file, options);
          }),
        );
        setSelectedFiles((prev) => [...prev, ...compressedFiles]);
        const newPreviews = compressedFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
      } catch (error) {
        console.error("Error comprimiendo imágenes:", error);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleBrandChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    setFormData({ ...formData, vehicle_brand_id: brandId, vehicle_model_id: "" });
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

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!/^[0-9]*$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
    selectedFiles.forEach((file) => dataToSend.append("images[]", file));

    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`${API_BASE_URL}/my-advertisements`, dataToSend, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      navigate("/mis-anuncios");
    } catch (error) {
      console.error(error);
      alert("Error al publicar. Revisa los campos y tu conexión.");
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
                      <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 rounded-full w-7 h-7 font-bold border-2 border-zinc-800 flex items-center justify-center hover:bg-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10">✕</button>
                      {index === 0 && <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold border border-zinc-700">Principal</div>}
                    </div>
                  ))}
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
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </label>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-red-500 font-bold uppercase text-xs tracking-widest border-l-4 border-red-600 pl-3">Detalles Comerciales</h2>
            
            {/* ELIMINADO EL CAMPO TÍTULO: AHORA EL PRECIO OCUPA ESPACIO, SEGUIDO POR KILÓMETROS Y PROVINCIA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input type="text" name="price" value={formData.price} onChange={handleNumericChange} placeholder="Precio" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-8 outline-none text-red-500 font-bold focus:ring-2 focus:ring-red-600" />
                <span className="absolute left-3 top-3 text-red-700 font-bold">€</span>
              </div>
              <input type="text" name="mileage" value={formData.mileage} onChange={handleNumericChange} placeholder="Kilometraje (Km)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600" />
              <select name="province_id" required value={formData.province_id} onChange={handleChange} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-600">
                <option value="">Provincia</option>
                {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <textarea name="description" rows={4} required value={formData.description} onChange={handleChange} placeholder="Describe el estado del vehículo, extras, mantenimientos..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-red-600" />
          </section>

          <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/30 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3">
            {loading ? 'Arrancando Motor...' : 'Publicar Anuncio'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAd;