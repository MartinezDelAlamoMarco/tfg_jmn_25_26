import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import { 
  MessageSquare, 
  User, 
  ChevronRight, 
  Car,
  Search,
  Clock
} from 'lucide-react';

interface Conversation {
  id: number;
  advertisement: {
    title: string;
    vehicle: { brand: { name: string }; vehicle_model: { name: string } };
  };
  buyer: { name: string };
  seller: { name: string };
  updated_at: string;
  seller_id: number;
}

const ChatList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const token = localStorage.getItem('auth_token');
  const currentUserId = Number(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
      } catch (err) {
        console.error("Error cargando conversaciones", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token]);

  const filteredChats = conversations.filter(chat => 
    chat.advertisement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">
              Mis <span className="text-red-600">Mensajes</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Gestiona tus negociaciones de compra y venta</p>
          </div>

          {/* Buscador Estilo Zinc */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none w-full md:w-64 transition-all text-sm"
            />
          </div>
        </div>

        {/* Lista de Chats */}
        {filteredChats.length === 0 ? (
          <div className="bg-zinc-900/50 rounded-3xl p-16 text-center border border-zinc-800">
            <div className="bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-red-600" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-white">No tienes mensajes aún</h3>
            <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
              Cuando contactes con vendedores o te pregunten por tus vehículos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredChats.map((chat) => {
              const isSeller = currentUserId === chat.seller_id;
              const otherUserName = isSeller ? chat.buyer.name : chat.seller.name;

              return (
                <div 
                  key={chat.id}
                  onClick={() => navigate(`/mensajes/${chat.id}`)}
                  className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-red-600/50 hover:bg-zinc-800/50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-600 font-bold text-xl group-hover:scale-110 transition-transform">
                      {otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        {otherUserName}
                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest">
                          {isSeller ? 'Comprador' : 'Vendedor'}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                        <Car size={14} className="text-red-600" />
                        <span className="truncate max-w-[200px] md:max-w-md">
                          {chat.advertisement.vehicle.brand.name} {chat.advertisement.vehicle.vehicle_model.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                      <div className="flex items-center gap-1 text-zinc-500 text-xs uppercase font-bold">
                        <Clock size={12} />
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="text-zinc-700 group-hover:text-red-600 transition-all transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;