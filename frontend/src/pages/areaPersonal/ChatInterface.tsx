import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from "../../config"; 
import { 
  Send, ArrowLeft, Car, MessageSquare, Search, Clock
} from 'lucide-react';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- INTERFACES ---
interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

// NUEVA INTERFAZ PLANA (Coincide con tu Vista SQL)
interface ConversationFlat {
  id: number;
  advertisement_id: number;
  buyer_id: number;
  seller_id: number;
  created_at: string;
  updated_at: string;
  advertisement_title: string;
  advertisement_price: number;
  brand_name: string;
  model_name: string;
  buyer_name: string;
  seller_name: string;
  messages?: Message[];
}

const ChatInterface: React.FC = () => {
  // Estados Globales
  const [conversations, setConversations] = useState<ConversationFlat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  
  // Estados del Chat Activo
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChatData, setActiveChatData] = useState<ConversationFlat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('auth_token');
  const currentUserId = Number(localStorage.getItem('user_id'));

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (err) {
      console.error("Error cargando conversaciones", err);
    } finally {
      setLoadingList(false);
    }
  };

  // 1. Cargar la lista inicial y SUSCRIBIRSE a la tabla de conversaciones
  useEffect(() => {
    if (token) {
      fetchConversations();

      // Realtime para la lista izquierda (Sube el chat si hay nuevos mensajes)
      const listChannel = supabase
        .channel('public:conversations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
          fetchConversations(); 
        })
        .subscribe();

      return () => { supabase.removeChannel(listChannel); };
    }
  }, [token]);

  // 2. Cargar mensajes y SUSCRIBIRSE a la tabla de mensajes del chat activo
  useEffect(() => {
    if (!activeChatId || !token) return;

    setLoadingChat(true);

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/conversations/${activeChatId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setActiveChatData(response.data);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error("Error al cargar el chat", err);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchMessages();

    // Realtime para los mensajes de texto
    const chatChannel = supabase
      .channel(`chat-${activeChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChatId}` },
        (payload) => {
          const incomingMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === incomingMessage.id)) return prev;
            return [...prev, incomingMessage];
          });
        }
      ).subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, [activeChatId, token]);

  // Autoscroll hacia abajo al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // 3. Enviar un mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/conversations/${activeChatId}/messages`, {
        content: newMessage
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Error al enviar", err);
    }
  };

  // Filtrado de la búsqueda actualizado a variables planas
  const filteredChats = conversations.filter(chat => 
    chat.advertisement_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingList) return <div className="h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div></div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white overflow-hidden">
      
      {/* PANEL IZQUIERDO: LISTA DE CHATS */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-zinc-800 bg-zinc-950`}>
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-2xl font-black italic uppercase mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" placeholder="Buscar chat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center p-8 text-zinc-500 text-sm">No hay mensajes disponibles.</div>
          ) : (
            filteredChats.map((chat) => {
              const isSeller = currentUserId === chat.seller_id;
              const otherUserName = isSeller ? chat.buyer_name : chat.seller_name;
              const isActive = chat.id === activeChatId;

              return (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-all flex gap-4 items-center ${isActive ? 'bg-zinc-800/80 border-l-4 border-l-red-600' : 'hover:bg-zinc-900'}`}
                >
                  <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-red-600 font-bold text-lg">
                    {otherUserName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-zinc-100 truncate">{otherUserName}</h3>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                      <Car size={12} className="text-red-600"/> 
                      {chat.brand_name} {chat.model_name}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO: ÁREA DE CHAT */}
      <div className={`${!activeChatId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-zinc-900`}>
        {!activeChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <MessageSquare size={64} className="text-zinc-800 mb-4" />
            <h2 className="text-xl font-bold text-zinc-300">Selecciona un chat</h2>
            <p className="text-sm mt-2 max-w-sm text-center">Haz clic en una conversación de la izquierda para empezar a negociar.</p>
          </div>
        ) : loadingChat ? (
          <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div></div>
        ) : (
          <>
            <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-4">
              <button onClick={() => setActiveChatId(null)} className="md:hidden text-zinc-400 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                {(currentUserId === activeChatData?.seller_id ? activeChatData?.buyer_name : activeChatData?.seller_name)?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold truncate">
                  {currentUserId === activeChatData?.seller_id ? activeChatData?.buyer_name : activeChatData?.seller_name}
                </h2>
                <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                  Sobre: <span className="text-zinc-300">{activeChatData?.advertisement_title}</span>
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-red-700 rounded-br-none' : 'bg-zinc-800 rounded-bl-none'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-50 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white p-3 rounded-xl transition-colors">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default ChatInterface;