import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import { 
  Send, 
  ArrowLeft, 
  Car, 
  ChevronRight
} from 'lucide-react';

interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

interface ConversationData {
  id: number;
  advertisement: {
    id: number;
    title: string;
    price: number;
    vehicle: { brand: { name: string }; vehicle_model: { name: string } };
  };
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
  messages: Message[]; // Los mensajes vienen dentro de la conversación según tu ChatController
}

const ChatScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('auth_token');
  const currentUserId = Number(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hacemos UNA SOLA llamada, ya que tu controlador devuelve todo el objeto con mensajes incluidos
        const response = await axios.get(`${API_BASE_URL}/conversations/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        const data = response.data;
        setConversation(data);
        setMessages(data.messages || []); // Extraemos los mensajes del objeto conversación
      } catch (err) {
        console.error("Error al cargar el chat", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchData();
      const interval = setInterval(fetchData, 4000); // Polling cada 4 segundos
      return () => clearInterval(interval);
    }
  }, [id, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Ruta corregida: /conversations/{id}/messages
      const response = await axios.post(`${API_BASE_URL}/conversations/${id}/messages`, {
        content: newMessage
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      // Actualización inmediata en el frontend
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Error al enviar mensaje", err);
      alert("No se pudo enviar el mensaje");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
    </div>
  );

  const otherUser = currentUserId === conversation?.seller.id ? conversation?.buyer : conversation?.seller;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-white">
      
      {/* HEADER DEL CHAT */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/mis-mensajes')} 
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/20">
              {otherUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-white leading-none">{otherUser?.name}</h2>
              <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                En línea ahora
              </p>
            </div>
          </div>

          {/* Información del Vehículo */}
          {conversation?.advertisement && (
            <div 
              onClick={() => navigate(`/advertisement/${conversation.advertisement.id}`)}
              className="hidden md:flex items-center gap-3 bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-xl border border-zinc-700 cursor-pointer transition-all"
            >
              <div className="p-2 bg-zinc-900 rounded-lg">
                <Car size={16} className="text-red-600" />
              </div>
              <div className="pr-2 text-left">
                <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest leading-none mb-1">Sobre el anuncio</p>
                <p className="text-xs font-bold text-zinc-200 truncate max-w-[150px]">
                  {conversation.advertisement.title}
                </p>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </div>
          )}
        </div>
      </div>

      {/* CUERPO DEL MENSAJE */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950"
      >
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex justify-center my-6">
            <span className="bg-zinc-900 text-zinc-500 text-[10px] px-4 py-1.5 rounded-full border border-zinc-800 uppercase tracking-widest font-black">
              Inicio de la conversación
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] md:max-w-[60%] p-4 rounded-2xl shadow-sm ${
                  isMe 
                    ? 'bg-red-700 text-white rounded-br-none' 
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-[9px] mt-2 font-bold opacity-50 text-right uppercase">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INPUT DE MENSAJE */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm shadow-inner"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-red-900/20 cursor-pointer active:scale-95"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;