import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- AÑADIDO IMPORT DE TRADUCCIÓN

interface Advertisement {
  id: number;
  price: number;
  description: string;
  description_en?: string;
  views: number;
  is_rent: boolean;
  state_name?: string;
  brand_name?: string;
  model_name?: string;
  km?: number;
  year?: number;
  doors?: number;
  fuel_type_name?: string;
  transmission_name?: string;
  tonality_name?: string;
  province_name?: string;
  images: any;
}

const Home = () => {
  const { t } = useTranslation(); // <-- INICIALIZADO EL HOOK DE TRADUCCIÓN
  const autoPart = APP_NAME.slice(0, 4);
  const marketPart = APP_NAME.slice(4);

  // Guardamos TODOS los anuncios aquí
  const [allAdvertisements, setAllAdvertisements] = useState<Advertisement[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  // Estado para controlar si el panel avanzado está abierto
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estado unificado para todos los filtros
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    province: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    minKm: "",
    maxKm: "",
    fuel: "",
    transmission: "",
    color: "",
    doors: "",
  });

  useEffect(() => {
    handleGetAdvertisements();
  }, []);

  const handleGetAdvertisements = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/advertisements`)
      .then((res) => {
        // Guardamos solo los de venta
        const ventas = res.data.filter(
          (ad: any) => !ad.is_rent || ad.is_rent === 0 || ad.is_rent === "0",
        );
        setAllAdvertisements(ventas);
      })
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    // Si el usuario cambia la marca, reseteamos automáticamente el modelo
    if (name === "brand") {
      setFilters((prev) => ({
        ...prev,
        brand: value,
        model: "", // Forzamos el reseteo del modelo
      }));
    } else {
      // Para el resto de filtros, comportamiento normal
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      brand: "",
      model: "",
      province: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      minKm: "",
      maxKm: "",
      fuel: "",
      transmission: "",
      color: "",
      doors: "",
    });
  };

  // --- EXTRACCIÓN DINÁMICA DE OPCIONES (Sin peticiones extra a BD) ---
  const availableBrands = [
    ...new Set(allAdvertisements.map((a) => a.brand_name)),
  ].filter(Boolean);
  const availableModels = [
    ...new Set(
      allAdvertisements
        .filter((a) => !filters.brand || a.brand_name === filters.brand)
        .map((a) => a.model_name),
    ),
  ].filter(Boolean);
  const availableProvinces = [
    ...new Set(allAdvertisements.map((a) => a.province_name)),
  ].filter(Boolean);
  const availableFuels = [
    ...new Set(allAdvertisements.map((a) => a.fuel_type_name)),
  ].filter(Boolean);
  const availableTransmissions = [
    ...new Set(allAdvertisements.map((a) => a.transmission_name)),
  ].filter(Boolean);
  const availableColors = [
    ...new Set(allAdvertisements.map((a) => a.tonality_name)),
  ].filter(Boolean);

  // --- LÓGICA DE FILTRADO (useMemo para no recalcular en cada render si no cambian los filtros) ---
  const filteredAds = useMemo(() => {
    return allAdvertisements.filter((ad) => {
      if (filters.brand && ad.brand_name !== filters.brand) return false;
      if (filters.model && ad.model_name !== filters.model) return false;
      if (filters.province && ad.province_name !== filters.province)
        return false;
      if (filters.fuel && ad.fuel_type_name !== filters.fuel) return false;
      if (filters.transmission && ad.transmission_name !== filters.transmission)
        return false;
      if (filters.color && ad.tonality_name !== filters.color) return false;
      if (filters.doors && Number(ad.doors) !== Number(filters.doors))
        return false;

      if (filters.minPrice && Number(ad.price) < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && Number(ad.price) > Number(filters.maxPrice))
        return false;

      if (filters.minYear && Number(ad.year) < Number(filters.minYear))
        return false;
      if (filters.maxYear && Number(ad.year) > Number(filters.maxYear))
        return false;

      if (filters.minKm && Number(ad.km) < Number(filters.minKm)) return false;
      if (filters.maxKm && Number(ad.km) > Number(filters.maxKm)) return false;

      return true;
    });
  }, [allAdvertisements, filters]);

  if (loading && allAdvertisements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {autoPart}
            <span className="text-red-700">{marketPart}</span>
          </h1>
          <p className="text-xl text-zinc-400">
            {t('home.title', 'Encuentra el vehículo perfecto para comprar')} {/* <-- MODIFICADO CON t() */}
          </p>
        </div>

        {/* --- SECCIÓN DE FILTROS --- */}
        <div className="bg-zinc-800 rounded-2xl p-6 mb-12 border border-zinc-700 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('filters.search_filters', 'Filtros de Búsqueda')}</h2> {/* <-- MODIFICADO CON t() */}
            <div className="space-x-4">
              <button
                onClick={clearFilters}
                className="text-sm text-zinc-400 hover:text-white underline"
              >
                {t('filters.clear', 'Limpiar filtros')} {/* <-- MODIFICADO CON t() */}
              </button>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded transition"
              >
                {showAdvancedFilters
                  ? t('filters.hide', "Ocultar avanzados") /* <-- MODIFICADO CON t() */
                  : t('filters.advanced', "Filtros avanzados ⬇")} {/* <-- MODIFICADO CON t() */}
              </button>
            </div>
          </div>

          {/* Filtros Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none focus:border-red-500"
            >
              <option value="">{t('filters.all_brands', 'Todas las marcas')}</option> {/* <-- MODIFICADO CON t() */}
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              disabled={!filters.brand}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none disabled:opacity-50"
            >
              <option value="">{t('filters.all_models', 'Todos los modelos')}</option> {/* <-- MODIFICADO CON t() */}
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              name="province"
              value={filters.province}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none focus:border-red-500"
            >
              <option value="">{t('filters.any_province', 'Cualquier provincia')}</option> {/* <-- MODIFICADO CON t() */}
              {availableProvinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros Avanzados Colapsables */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-700 animate-in slide-in-from-top-2">
              <input
                type="number"
                name="minPrice"
                placeholder={t('filters.min_price', "Precio Min (€)")} // <-- MODIFICADO CON t()
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder={t('filters.max_price', "Precio Max (€)")} // <-- MODIFICADO CON t()
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              />

              <input
                type="number"
                name="minYear"
                placeholder={t('filters.min_year', "Año Min")} // <-- MODIFICADO CON t()
                value={filters.minYear}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              />
              <input
                type="number"
                name="maxYear"
                placeholder={t('filters.max_year', "Año Max")} // <-- MODIFICADO CON t()
                value={filters.maxYear}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              />

              <input
                type="number"
                name="minKm"
                placeholder={t('filters.min_km', "Km Min")} // <-- MODIFICADO CON t()
                value={filters.minKm}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              />
              <input
                type="number"
                name="maxKm"
                placeholder={t('filters.max_km', "Km Max")} // <-- MODIFICADO CON t()
                value={filters.maxKm}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              />

              <select
                name="fuel"
                value={filters.fuel}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              >
                <option value="">{t('common.fuel', 'Combustible')}</option> {/* <-- MODIFICADO CON t() */}
                {availableFuels.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              >
                <option value="">{t('common.transmission', 'Transmisión')}</option> {/* <-- MODIFICADO CON t() */}
                {availableTransmissions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                name="color"
                value={filters.color}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              >
                <option value="">{t('common.color', 'Color')}</option> {/* <-- MODIFICADO CON t() */}
                {availableColors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                name="doors"
                value={filters.doors}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white outline-none"
              >
                <option value="">{t('filters.doors_qty', 'Nº Puertas')}</option> {/* <-- MODIFICADO CON t() */}
                <option value="2">{t('filters.doors_2', '2 puertas')}</option> {/* <-- MODIFICADO CON t() */}
                <option value="3">{t('filters.doors_3', '3 puertas')}</option> {/* <-- MODIFICADO CON t() */}
                <option value="4">{t('filters.doors_4', '4 puertas')}</option> {/* <-- MODIFICADO CON t() */}
                <option value="5">{t('filters.doors_5', '5 puertas')}</option> {/* <-- MODIFICADO CON t() */}
              </select>
            </div>
          )}
        </div>

        {/* --- LISTA DE ANUNCIOS FILTRADOS --- */}
        <div className="mb-4 text-zinc-400 font-bold">
          {filteredAds.length} {t('home.vehicles_found', 'vehículos encontrados')} {/* <-- MODIFICADO CON t() */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((v) => {
            // PARSEO DE IMÁGENES ULTRA SEGURO (Se mantiene igual que lo tenías)
            let parsedImages = [];
            if (typeof v.images === "string") {
              try {
                parsedImages = JSON.parse(v.images);
              } catch (e) {
                parsedImages = [];
              }
            } else {
              parsedImages = v.images || [];
            }
            const imageUrl =
              parsedImages.length > 0 ? parsedImages[0].image_url : null;

            return (
              <div
                key={v.id}
                className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 flex flex-col hover:shadow-2xl transition group relative"
              >
                {/* ... tu maquetación de tarjeta de vehículo igual que antes ... */}
                <div className="absolute top-8 left-8 z-10 bg-black/80 backdrop-blur-sm px-3 py-1 rounded border border-zinc-700 text-[10px] font-bold uppercase tracking-widest shadow-lg text-white">
                  {t('common.sale', 'Venta')} {/* <-- MODIFICADO CON t() */}
                </div>
                <div className="h-48 bg-zinc-900 rounded-lg mb-4 overflow-hidden border border-zinc-700 relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Coche"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 uppercase font-bold text-sm">
                      {t('common.no_photo', 'Sin foto')} {/* <-- MODIFICADO CON t() */}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-xl font-bold uppercase truncate">
                    {v.brand_name} {v.model_name}
                  </h3>
                  <span className="px-2 py-1 text-[10px] bg-red-700/20 text-red-300 rounded-full font-bold uppercase whitespace-nowrap">
                    {v.state_name || t('common.available', "Disponible")} {/* <-- MODIFICADO CON t() */}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-6 mt-auto">
                  <p className="text-xs text-zinc-400">
                    {v.year} • {v.km} km • {v.fuel_type_name} •{" "}
                    {v.transmission_name}
                  </p>
                  <div className="flex justify-between items-end">
                    <p className="text-3xl font-black">
                      {Number(v.price).toLocaleString("es-ES")} €
                    </p>
                  </div>
                </div>
                <Link
                  to={`/advertisement/${v.id}`}
                  className="block w-full text-center py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition uppercase tracking-widest text-sm"
                >
                  {t('home.view_details', 'Ver detalles')}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Home;