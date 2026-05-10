import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, APP_NAME } from "../../config"; 
import { 
  Send, ArrowLeft, Car, MessageSquare, Search, 
  MoreVertical, Trash2, Ban, CheckCircle2, CalendarClock, Star, X 
} from 'lucide-react';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Message {
  id: number;
  sender_id: number | string | null; 
  content: string;
  created_at: string;
  is_read?: boolean; 
}

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
  chat_status?: 'active' | 'sold' | 'disabled';
  ad_status?: 'disponible' | 'reservado' | 'vendido'; 
  unread_count?: number; 
  messages?: Message[];
}

const ChatInterface: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationFlat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('auth_token');

  // --- ESTADOS PARA VALORACIÓN ---
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [dismissedReview, setDismissedReview] = useState(false); // NUEVO: Saber si cerró la ventana

  const activeChatData = conversations.find(c => c.id === activeChatId) || null;
  const isCurrentUserSeller = currentUserId !== null && activeChatData && String(currentUserId) === String(activeChatData.seller_id);

  // 1. Identificación del usuario
  useEffect(() => {
    let storedId = localStorage.getItem('user_id');
    if (!storedId) {
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try { storedId = JSON.parse(storedUserStr).id; } catch(e) {}
      }
    }
    if (storedId) {
      setCurrentUserId(String(storedId));
    } else if (token) {
      axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data && res.data.id) {
            setCurrentUserId(String(res.data.id));
            localStorage.setItem('user_id', res.data.id);
          }
        });
    }
  }, [token]);

  const fetchConversations = async () => {
    setLoadingList(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (err) { console.error(err); } finally { setLoadingList(false); }
  };

  // --- FUNCIÓN: MARCAR COMO LEÍDO ---
  const markAsRead = async (chatId: number) => {
    setConversations(prev => prev.map(c => 
      c.id === chatId ? { ...c, unread_count: 0 } : c
    ));
    
    try {
      await axios.post(`${API_BASE_URL}/conversations/${chatId}/read`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchConversations();
    } catch (err) {
      console.error("No se pudo marcar como leído", err);
    }
  };

  // 2. Suscripción GLOBAL para NOTIFICACIONES
  useEffect(() => {
    if (token) {
      fetchConversations();

      const convChannel = supabase.channel('global-conv-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => fetchConversations())
        .subscribe();

      const msgChannel = supabase.channel('global-msg-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchConversations())
        .subscribe();

      return () => {
        supabase.removeChannel(convChannel);
        supabase.removeChannel(msgChannel);
      };
    }
  }, [token]);

  // 3. Carga de mensajes del chat activo
  useEffect(() => {
    if (!activeChatId || !token) return;
    setLoadingChat(true);
    setRating(0);
    setReviewComment('');
    setHasReviewed(false);
    setDismissedReview(false); // Reiniciamos por si entra a otro chat vendido

    axios.get(`${API_BASE_URL}/conversations/${activeChatId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setMessages(res.data.messages || []);
        setLoadingChat(false);
        markAsRead(activeChatId);
      });

    const chatChannel = supabase.channel(`chat-${activeChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChatId}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]);
          
          if (String(incoming.sender_id) !== String(currentUserId)) {
            markAsRead(activeChatId);
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(chatChannel); };
  }, [activeChatId, token, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // --- ACCIONES ---

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    
    const msgContent = newMessage;
    setNewMessage(''); 
    
    try {
      const res = await axios.post(`${API_BASE_URL}/conversations/${activeChatId}/messages`, { content: msgContent }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => prev.some(m => m.id === res.data.id) ? prev : [...prev, res.data]);
    } catch (err) { 
      setNewMessage(msgContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSendMessage();
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatId || !window.confirm("¿Seguro que quieres eliminar este chat permanentemente?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/conversations/${activeChatId}`, { headers: { Authorization: `Bearer ${token}` } });
      setConversations(prev => prev.filter(c => c.id !== activeChatId));
      setActiveChatId(null);
    } catch (err) { alert("Error al eliminar el chat."); }
  };

  const handleReserve = async () => {
    if (!activeChatId || !window.confirm("¿Reservar vehículo?")) return;
    await axios.post(`${API_BASE_URL}/conversations/${activeChatId}/reserve`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchConversations();
  };

  const handleConfirmSale = async () => {
    if (!activeChatId || !window.confirm("¿Confirmar venta final?")) return;
    await axios.post(`${API_BASE_URL}/conversations/${activeChatId}/sell`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchConversations();
  };

  const submitReview = async () => {
    if (!rating || !activeChatData) return;
    setLoadingReview(true);
    try {
      await axios.post(`${API_BASE_URL}/reviews`, {
        advertisement_id: activeChatData.advertisement_id,
        rating,
        comment: reviewComment
      }, { headers: { Authorization: `Bearer ${token}` } });
      setHasReviewed(true);
      alert("¡Valoración enviada!");
    } catch (err) { alert("Error al enviar valoración."); } finally { setLoadingReview(false); }
  };

  const filteredChats = conversations.filter(c => 
    c.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans">
      
      {/* PANEL IZQUIERDO: LISTA */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-96 shrink-0 flex-col border-r border-zinc-800 bg-[#111]`}>
        <div className="p-4 bg-[#1a1a1a] border-b border-zinc-800">
          <h2 className="text-2xl font-black italic uppercase mb-4 text-white">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl outline-none text-sm focus:border-red-600 transition-colors" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-8 text-center text-zinc-500 text-sm animate-pulse italic">
              Cargando chats...
            </div>
          ) : (
            filteredChats.map((chat) => {
              const otherName = String(currentUserId) === String(chat.seller_id) ? chat.buyer_name : chat.seller_name;
              const unread = chat.id === activeChatId ? 0 : (chat.unread_count || 0);

              return (
                <div key={chat.id} onClick={() => setActiveChatId(chat.id)}
                  className={`p-4 border-b border-zinc-800/50 cursor-pointer flex gap-4 items-center ${chat.id === activeChatId ? 'bg-zinc-800/80 border-l-4 border-l-red-600' : 'hover:bg-zinc-900'}`}>
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-red-500 font-bold border border-zinc-700 shadow-sm relative shrink-0">
                    {otherName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold truncate text-[15px]">{otherName}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-zinc-400 truncate flex items-center gap-1"><Car size={12} className="text-red-500 shrink-0"/> {chat.brand_name} {chat.model_name}</p>
                      {unread > 0 && (
                        <div className="bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-lg animate-pulse shrink-0 ml-2">
                          {unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ÁREA DE CHAT */}
      <div className={`${!activeChatId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#0f0f0f] relative`}>
        {activeChatId && !loadingChat ? (
          <div className="flex flex-col h-full">
            {/* CABECERA */}
            <div className="bg-[#1a1a1a] px-3 md:px-4 py-3 border-b border-zinc-800 flex items-center justify-between z-20 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setActiveChatId(null)} className="md:hidden text-zinc-400 p-1 -ml-1 hover:text-white transition-colors"><ArrowLeft size={22} /></button>
                <div className="h-10 w-10 shrink-0 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
                  {(String(currentUserId) === String(activeChatData?.seller_id) ? activeChatData?.buyer_name : activeChatData?.seller_name)?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold truncate text-white text-[15px] leading-tight">
                    {String(currentUserId) === String(activeChatData?.seller_id) ? activeChatData?.buyer_name : activeChatData?.seller_name}
                  </h2>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    Negociando por: <span className="text-zinc-200 font-bold">{activeChatData?.brand_name} {activeChatData?.model_name}</span> 
                    <span className="ml-1 text-red-500 font-black">{activeChatData?.advertisement_price}€</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <button onClick={handleDeleteChat} className="p-2 text-zinc-500 hover:text-red-500 transition" title="Borrar Chat">
                  <Trash2 size={20} />
                </button>
                <div className="relative">
                  <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-zinc-400 hover:text-white transition"><MoreVertical size={20} /></button>
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                      {isCurrentUserSeller && activeChatData?.chat_status !== 'disabled' && (
                        <>
                          <button onClick={handleReserve} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 text-left"><CalendarClock size={16} /> Reservar vehículo</button>
                          <button onClick={handleConfirmSale} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-green-500 hover:bg-zinc-800 text-left font-bold"><CheckCircle2 size={16} /> Confirmar venta</button>
                          <div className="h-px bg-zinc-800 my-1"></div>
                        </>
                      )}
                      <button className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-950/20 transition text-left"><Ban size={16} /> Bloquear usuario</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MENSAJES */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
              {messages.map((msg) => {
                const isMe = String(msg.sender_id) === String(currentUserId);
                const isSystem = !msg.sender_id || String(msg.sender_id) === '0' || String(msg.sender_id) === '2';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex flex-col items-center my-8 animate-in fade-in zoom-in duration-500">
                      <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-2 italic">Notificación de {APP_NAME}</span>
                      <div className="bg-red-950/30 border border-red-900/40 text-red-200 text-xs px-8 py-4 rounded-2xl text-center max-w-sm shadow-xl italic leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? 'bg-red-600 text-white rounded-tr-sm shadow-md' : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700 shadow-md'}`}>
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium wrap-break-words">{msg.content}</p>
                      <p className="text-[9px] mt-1 text-right opacity-50 font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VALORACIÓN (Con botón de cerrar "X") */}
            {activeChatData?.chat_status === 'sold' && String(currentUserId) === String(activeChatData?.buyer_id) && !hasReviewed && !dismissedReview && (
              <div className="mx-4 mb-4 p-6 bg-zinc-800 border-2 border-yellow-600/30 rounded-2xl text-center animate-in zoom-in shadow-2xl relative">
                
                <button 
                  onClick={() => setDismissedReview(true)} 
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                  title="Cerrar sin valorar"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black uppercase italic mb-2 text-white">¡Compra finalizada!</h3>
                <p className="text-zinc-400 text-xs mb-4 uppercase tracking-widest mr-6 ml-6">Valora a {activeChatData?.seller_name} para ayudar a la comunidad</p>
                <div className="flex justify-center gap-3 mb-5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className={`transition-transform active:scale-90 ${rating >= s ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-zinc-700'}`}>
                      <Star size={36} fill={rating >= s ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea placeholder="Cuéntanos cómo fue todo (opcional)..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-sm mb-4 outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition" />
                <button onClick={submitReview} disabled={!rating || loadingReview} className="w-full py-4 bg-yellow-600 text-black font-black uppercase tracking-widest rounded-xl transition hover:bg-yellow-500 disabled:opacity-50 shadow-lg">
                  {loadingReview ? 'Enviando...' : 'Enviar Valoración'}
                </button>
              </div>
            )}

            {/* PIE DE CHAT */}
            <div className="p-3 md:p-4 bg-[#1a1a1a] border-t border-zinc-800 pb-safe">
              {activeChatData?.chat_status === 'disabled' ? (
                <div className="flex justify-center">
                  <button onClick={handleDeleteChat} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 px-8 rounded-xl border border-zinc-700 transition w-full max-w-md shadow-lg italic tracking-wide uppercase text-xs">
                    Coche vendido a otro usuario - Eliminar Chat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto w-full">
                  <textarea 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje..." 
                    rows={1}
                    style={{ minHeight: '46px', maxHeight: '120px' }}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 outline-none text-sm resize-none focus:border-red-600 transition shadow-inner" 
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-red-600 h-46px w-46px rounded-full flex items-center justify-center shrink-0 hover:bg-red-500 transition disabled:opacity-50 shadow-md">
                    {/* El translate-x-[2px] compensa la forma del icono para que se vea perfectamente centrado */}
                    <Send size={18} className="translate-x-2px" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center bg-[#0a0a0a]">
            <div className="h-24 w-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800/50 shadow-xl">
              <MessageSquare size={40} className="text-zinc-700" />
            </div>
            <h3 className="font-black uppercase italic text-zinc-400 text-xl tracking-tighter">Buzón de Negociación</h3>
            <p className="max-w-xs text-xs mt-2 leading-relaxed">Selecciona un chat lateral para empezar a hablar con el vendedor o gestionar tu compra.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;