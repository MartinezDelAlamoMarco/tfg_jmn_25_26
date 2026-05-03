import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, MapPin, Calendar, Gauge, MessageCircle, 
  Trash2, ChevronLeft, ChevronRight,
  Zap, Settings, Fuel, DoorOpen, UserCheck
} from 'lucide-react';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estado para el ID del vendedor
  const [sellerId, setSellerId] = useState<string | null>(null);

  const token = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role');
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchVehicleDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/advertisement/${id}`);
        const data = response.data;
        
        // Log para depuración en consola
        console.log("¡DATOS DE LARAVEL! ->", data);
        
        setVehicle(data);
        
        // BUSQUEDA DEL SELLER ID (Prioridad: Anuncio > Objeto User > Dueño del Vehículo)
        const foundId = data.user_id || data.user?.id || data.vehicle?.owner_id;
        
        if (foundId) {
          console.log("Vendedor detectado con ID:", foundId);
          setSellerId(foundId.toString());
        } else {
          console.error("ALERTA: No se encontró ID de vendedor en el JSON.");
        }

        // Verificar favorito si hay token
        if (token) {
          try {
            // Nota: Si esto da 404, asegúrate de tener la ruta en api.php
            const favResponse = await axios.get(`http://localhost:8000/api/favorites/check/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(favResponse.data.is_favorite);
          } catch (e) {
            console.warn("Ruta de check favoritos no encontrada o error de servidor");
          }
        }
      } catch (err: any) {
        setError('Error al cargar los detalles del vehículo');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetail();
  }, [id, token]);

  const handleContact = async () => {
    if (!token) {
      alert('Debes iniciar sesión para contactar');
      navigate('/login');
      return;
    }

    if (!sellerId) {
      alert('No se pudo identificar al vendedor. Revisa la consola (F12).');
      return;
    }

    if (currentUserId && sellerId === currentUserId.toString()) {
      alert('Este anuncio es tuyo.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/conversations', {
        advertisement_id: vehicle.id,
        seller_id: sellerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate(`/mensajes/${response.data.id}`);
    } catch (err: any) {
      // Capturamos el error 500 y mostramos el mensaje real de Laravel
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error desconocido';
      alert('Error al crear conversación: ' + errorMsg);
      console.error("Detalle del error 500:", err.response?.data);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!token) return alert('Debes iniciar sesión');
    try {
      await axios.post(`http://localhost:8000/api/favorites/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error al actualizar favorito');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este anuncio?')) {
      try {
        await axios.delete(`http://localhost:8000/api/advertisement/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/');
      } catch (err) {
        alert('No se pudo eliminar el anuncio.');
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-bold">Cargando...</div>;
  if (error || !vehicle) return <div className="min-h-screen bg-zinc-950 text-red-500 p-20 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contenido Multimedia */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 aspect-video flex items-center justify-center shadow-2xl">
              {vehicle.images?.length > 0 ? (
                <img 
                  src={vehicle.images[currentImageIndex].image_url} 
                  className="max-h-full object-contain" 
                  alt="Vehículo" 
                />
              ) : (
                <div className="text-zinc-700 font-black uppercase italic text-4xl">Sin Imágenes</div>
              )}
            </div>

            {/* Ficha Técnica */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="text-red-500" size={20} /> Detalles del Vehículo
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Combustible</p>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Fuel size={18} className="text-red-500" /> 
                    {vehicle.vehicle.fuel_type?.name || 'Gasolina'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Potencia</p>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Zap size={18} className="text-red-500" /> 
                    {vehicle.vehicle.power_hp} CV
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Transmisión</p>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Settings size={18} className="text-red-500" /> 
                    {vehicle.vehicle.transmission?.name || 'Manual'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Puertas</p>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <DoorOpen size={18} className="text-red-500" /> 
                    {vehicle.vehicle.doors}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">Descripción</h2>
              <p className="text-zinc-400 leading-relaxed italic">
                "{vehicle.description || 'No hay descripción disponible para este anuncio.'}"
              </p>
            </div>
          </div>

          {/* Panel Lateral de Acción */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl sticky top-24 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {vehicle.is_rent ? 'Alquiler' : 'En Venta'}
                  </span>
                  <h1 className="text-3xl font-bold mt-4 leading-none">
                    {vehicle.vehicle.model.brand.name} <br/>
                    <span className="text-zinc-500 text-2xl font-medium">{vehicle.vehicle.model.name}</span>
                  </h1>
                </div>
                <button 
                  onClick={toggleFavorite} 
                  className={`p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                    isFavorite ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  <Heart fill={isFavorite ? "currentColor" : "none"} size={22} />
                </button>
              </div>

              <div className="text-5xl font-black text-white mb-8 mt-6 tracking-tighter">
                {vehicle.price.toLocaleString()} <span className="text-2xl text-red-600 font-bold">€</span>
              </div>

              <button 
                onClick={handleContact} 
                disabled={actionLoading}
                className="w-full cursor-pointer bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
              >
                <MessageCircle size={20} /> 
                {actionLoading ? 'Iniciando Chat...' : 'Contactar Vendedor'}
              </button>

              {/* Información del Vendedor */}
              <div className="pt-6 mt-6 border-t border-zinc-800/50 flex items-center gap-4">
                <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 shadow-inner">
                  <UserCheck className="text-red-500" size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Vendedor</p>
                  <p className="text-lg font-bold text-zinc-200">
                    {vehicle.user?.name || 'Vendedor Particular'}
                  </p>
                </div>
              </div>

              {/* Acciones de Propietario o Admin */}
              {(userRole === 'admin' || (currentUserId && sellerId && currentUserId.toString() === sellerId)) && (
                <div className="mt-8 pt-4 border-t border-zinc-800/50">
                  <button 
                    onClick={handleDelete} 
                    className="w-full cursor-pointer text-zinc-600 hover:text-red-500 flex items-center justify-center gap-2 py-2 text-xs transition-colors font-bold uppercase tracking-tighter"
                  >
                    <Trash2 size={14} /> Eliminar Publicación
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;