import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import {
  API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_NAME,
} from "../../config";
import {
  Send,
  ArrowLeft,
  Car,
  MessageSquare,
  Search,
  MoreVertical,
  Trash2,
  Ban,
  CheckCircle2,
  CalendarClock,
  Star,
  X,
  CalendarPlus,
  Loader2,
  CalendarDays,
} from "lucide-react";

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
  chat_status?: "active" | "sold" | "disabled";
  ad_status?: "disponible" | "reservado" | "vendido";
  is_rent?: boolean;
  reserved_until?: string | null;
  unread_count?: number;
  messages?: Message[];
}

interface RentRecord {
  id: number;
  start_date: string;
  end_date: string;
  total_price: number;
}

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationFlat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [showRentManager, setShowRentManager] = useState(false);
  const [activeUserRents, setActiveUserRents] = useState<RentRecord[]>([]);
  const [loadingRents, setLoadingRents] = useState(false);

  const [isActionPending, setIsActionPending] = useState(false);
  const [pendingText, setPendingText] = useState("");

  const [showExtensionInput, setShowExtensionInput] = useState(false);
  const [extensionDate, setExtensionDate] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("auth_token");

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const activeChatData =
    conversations.find((c) => c.id === activeChatId) || null;
  const isCurrentUserSeller =
    currentUserId !== null &&
    activeChatData &&
    String(currentUserId) === String(activeChatData.seller_id);

  useEffect(() => {
    if (!showOptions) {
      setShowExtensionInput(false);
      setExtensionDate("");
      setShowRentManager(false);
    }
  }, [showOptions]);

  useEffect(() => {
    let storedId = localStorage.getItem("user_id");
    if (!storedId) {
      const storedUserStr = localStorage.getItem("user");
      if (storedUserStr) {
        try {
          storedId = JSON.parse(storedUserStr).id;
        } catch (e) {}
      }
    }
    if (storedId) {
      setCurrentUserId(String(storedId));
    } else if (token) {
      axios
        .get(`${API_BASE_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data && res.data.id) {
            setCurrentUserId(String(res.data.id));
            localStorage.setItem("user_id", res.data.id);
          }
        });
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const markAsRead = async (chatId: number) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unread_count: 0 } : c)),
    );
    try {
      await axios.post(
        `${API_BASE_URL}/conversations/${chatId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchConversations();
    } catch (err) {
      console.error("No se pudo marcar como leído", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchConversations();
      const convChannel = supabase
        .channel("global-conv-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "conversations" },
          () => fetchConversations(),
        )
        .subscribe();
      const msgChannel = supabase
        .channel("global-msg-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => fetchConversations(),
        )
        .subscribe();
      return () => {
        supabase.removeChannel(convChannel);
        supabase.removeChannel(msgChannel);
      };
    }
  }, [token]);

  useEffect(() => {
    if (!activeChatId || !token) return;
    setLoadingChat(true);
    setRating(0);
    setReviewComment("");
    setHasReviewed(false);
    setShowOptions(false);

    axios
      .get(`${API_BASE_URL}/conversations/${activeChatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data.messages || []);
        setLoadingChat(false);
        markAsRead(activeChatId);
      });

    const chatChannel = supabase
      .channel(`chat-${activeChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeChatId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );
          if (String(incoming.sender_id) !== String(currentUserId))
            markAsRead(activeChatId);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [activeChatId, token, currentUserId]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const openRentManager = async () => {
    if (!activeChatData) return;
    setShowRentManager(true);
    setLoadingRents(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/conversations/${activeChatData.advertisement_id}/${activeChatData.buyer_id}/rents`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveUserRents(res.data);
    } catch (err) {
      console.error("Error al cargar reservas", err);
    } finally {
      setLoadingRents(false);
    }
  };

  const cancelRent = async (rentId: number) => {
    if (!window.confirm(t('chat.cancel_rent_confirm', "¿Estás seguro de que quieres cancelar esta reserva de alquiler? Las fechas volverán a estar disponibles."))) return;
    setIsActionPending(true);
    setPendingText(t('chat.canceling_reserve', "Cancelando reserva..."));
    try {
      await axios.delete(`${API_BASE_URL}/rents/${rentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveUserRents((prev) => prev.filter((r) => r.id !== rentId));
    } catch (err) {
      alert(t('chat.cancel_rent_error', "Error al cancelar la reserva."));
    } finally {
      setIsActionPending(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    const msgContent = newMessage;
    setNewMessage("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/conversations/${activeChatId}/messages`,
        { content: msgContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) =>
        prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data],
      );
    } catch (err) {
      setNewMessage(msgContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteChat = async () => {
    if (
      !activeChatId ||
      !window.confirm(t('chat.delete_chat_confirm', "¿Seguro que quieres eliminar este chat permanentemente?"))
    )
      return;
    try {
      await axios.delete(`${API_BASE_URL}/conversations/${activeChatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c.id !== activeChatId));
      setActiveChatId(null);
    } catch (err) {
      alert(t('chat.delete_chat_error', "Error al eliminar el chat."));
    }
  };

  const handleFinalizeChat = async (chatId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/conversations/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c.id !== chatId));
      setActiveChatId(null);
    } catch (err) {
      console.error("Error al cerrar el chat automáticamente", err);
    }
  };

  const handleReserve = async () => {
    if (
      !activeChatId ||
      !window.confirm(t('chat.reserve_confirm', "¿Reservar vehículo para este comprador?"))
    )
      return;
    setPendingText(t('chat.reserving', "Reservando vehículo..."));
    setIsActionPending(true);
    try {
      await axios.post(
        `${API_BASE_URL}/conversations/${activeChatId}/reserve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowOptions(false);
      fetchConversations();
    } catch (err) {
      alert(t('chat.reserve_error', "Error al reservar."));
    } finally {
      setIsActionPending(false);
    }
  };

  const openExtensionMenu = () => {
    setShowExtensionInput(true);
    let defaultDate = new Date();
    if (activeChatData?.reserved_until) {
      defaultDate = new Date(activeChatData.reserved_until);
    } else {
      defaultDate.setDate(defaultDate.getDate() + 3);
    }
    defaultDate.setMinutes(
      defaultDate.getMinutes() - defaultDate.getTimezoneOffset(),
    );
    setExtensionDate(defaultDate.toISOString().slice(0, 16));
  };

  const handleExtendReserve = async () => {
    if (!activeChatId || !extensionDate) return;
    setPendingText(t('chat.extending_reserve', "Ampliando reserva..."));
    setIsActionPending(true);
    try {
      await axios.post(
        `${API_BASE_URL}/conversations/${activeChatId}/extend-reserve`,
        {
          reserved_until: extensionDate,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowOptions(false);
      fetchConversations();
    } catch (err) {
      alert(t('chat.extend_reserve_error', "Error al ampliar la reserva."));
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancelReserve = async () => {
    if (
      !activeChatId ||
      !window.confirm(t('chat.cancel_reserve_confirm', "¿Cancelar la reserva y volver a ponerlo disponible?"))
    )
      return;
    setPendingText(t('chat.canceling_reserve', "Cancelando reserva..."));
    setIsActionPending(true);
    try {
      await axios.post(
        `${API_BASE_URL}/conversations/${activeChatId}/cancel-reserve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchConversations();
    } catch (err) {
      alert(t('chat.cancel_reserve_error', "Error al cancelar la reserva."));
    } finally {
      setIsActionPending(false);
    }
  };

  const handleConfirmSale = async () => {
    if (
      !activeChatId ||
      !window.confirm(t('chat.confirm_sale_confirm', "¿Confirmar venta final? Esto cerrará el resto de chats."))
    )
      return;
    setPendingText(t('chat.confirming_sale', "Confirmando venta..."));
    setIsActionPending(true);
    try {
      await axios.post(
        `${API_BASE_URL}/conversations/${activeChatId}/sell`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowOptions(false);
      fetchConversations();
    } catch (err) {
      alert(t('chat.confirm_sale_error', "Error al confirmar venta."));
    } finally {
      setIsActionPending(false);
    }
  };

  const submitReview = async () => {
    if (!rating || !activeChatData) return;
    setLoadingReview(true);
    try {
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          advertisement_id: activeChatData.advertisement_id,
          rating,
          comment: reviewComment,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setHasReviewed(true);
      alert(t('chat.review_sent', "¡Valoración enviada! El chat se cerrará ahora."));
      await handleFinalizeChat(activeChatId!);
    } catch (err) {
      alert(t('chat.review_error', "Error al enviar valoración."));
    } finally {
      setLoadingReview(false);
    }
  };

  const filteredChats = conversations.filter(
    (c) =>
      c.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    // CORRECCIÓN 1: Se usa '100dvh' (dynamic viewport height) en lugar de '100vh' para que no quede oculto detrás de la barra de Chrome/Safari móvil
    <div className="flex h-[calc(100dvh-64px)] bg-zinc-950 text-zinc-100 overflow-hidden font-sans chat-root">
      {/* PANEL IZQUIERDA: LISTA */}
      <div className={`${activeChatId ? "hidden md:flex" : "flex"} w-full md:w-96 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900`}>
        <div className="p-4 bg-zinc-900/80 border-b border-zinc-800">
          <h2 className="text-3xl font-black italic uppercase mb-4 text-white">{t('chat.messages_title', 'Mensajes')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input type="text" placeholder={t('common.search', 'Buscar...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl outline-none text-base focus:border-red-600 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-8 text-center text-zinc-500 text-[15px] animate-pulse italic">{t('chat.loading_chats', 'Cargando chats...')}</div>
          ) : (
            filteredChats.map((chat) => {
              const otherName = String(currentUserId) === String(chat.seller_id) ? chat.buyer_name : chat.seller_name;
              const unread = chat.id === activeChatId ? 0 : chat.unread_count || 0;
              return (
                <div key={chat.id} onClick={() => setActiveChatId(chat.id)}
                  className={`p-4 border-b border-zinc-800/50 cursor-pointer flex gap-4 items-center ${chat.id === activeChatId ? "bg-zinc-800/80 border-l-4 border-l-red-600" : "hover:bg-zinc-900"}`}>
                  <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center text-red-500 text-lg font-bold border border-zinc-700 relative shrink-0">
                    {otherName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold truncate text-[17px]">{otherName}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[14px] text-zinc-400 truncate flex items-center gap-1.5">
                        <Car size={14} className="text-red-500 shrink-0" /> {chat.brand_name} {chat.model_name}
                      </p>
                      {unread > 0 && (
                        <div className="bg-red-600 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center shadow-lg animate-pulse shrink-0 ml-2">
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
      <div className={`${!activeChatId ? "hidden md:flex" : "flex"} flex-1 flex-col bg-zinc-950 relative`}>
        {activeChatId && !loadingChat ? (
          <div className="flex flex-col h-full relative">
            {isActionPending && (
              <div className="absolute inset-0 z-100 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="flex flex-col items-center p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl scale-in-center">
                  <Loader2 className="text-red-600 animate-spin mb-4" size={56} />
                  <p className="text-white font-black italic uppercase tracking-widest text-sm">{pendingText}</p>
                </div>
              </div>
            )}

            {/* CABECERA */}
            <div className="bg-zinc-900/80 px-3 md:px-5 py-4 border-b border-zinc-800 flex items-center justify-between z-20 shadow-md">
              {/* CORRECCIÓN 2: gap-2 en móvil, y el flex-1 empuja correctamente las opciones hacia el final para que nada se monte */}
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                <button onClick={() => setActiveChatId(null)} className="md:hidden text-zinc-400 p-1 -ml-1 hover:text-white transition-colors shrink-0"><ArrowLeft size={24} /></button>
                <div className="h-12 w-12 shrink-0 rounded-full bg-red-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {(String(currentUserId) === String(activeChatData?.seller_id) ? activeChatData?.buyer_name : activeChatData?.seller_name)?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 pr-2">
                  <h2 className="font-bold truncate text-white text-[16px] md:text-[17px] leading-tight">
                    {String(currentUserId) === String(activeChatData?.seller_id) ? activeChatData?.buyer_name : activeChatData?.seller_name}
                  </h2>
                  <p className="text-[12px] md:text-[13px] text-zinc-400 truncate mt-0.5">
                    {activeChatData?.is_rent ? t('chat.rent_of', 'Alquiler de: ') : t('chat.negotiating_for', 'Negociando por: ')}
                    <span className="text-zinc-200 font-bold">{activeChatData?.brand_name} {activeChatData?.model_name}</span>
                    <span className="ml-1.5 text-red-500 font-black">{activeChatData?.advertisement_price}€</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-3 shrink-0">
                <button onClick={handleDeleteChat} className="p-2 text-zinc-500 hover:text-red-500 transition" title={t('chat.delete_chat_title', "Borrar Chat")}><Trash2 size={22} /></button>
                <div className="relative">
                  <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-zinc-400 hover:text-white transition"><MoreVertical size={22} /></button>
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-[85vw] max-w-[18rem] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                      {isCurrentUserSeller && activeChatData?.chat_status !== "disabled" && (
                        <>
                          {/* LÓGICA DE ALQUILER */}
                          {activeChatData?.is_rent ? (
                            <button onClick={openRentManager} className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] text-zinc-300 hover:bg-zinc-800 text-left">
                              <CalendarDays size={18} /> {t('chat.manage_rents', "Gestionar Reservas")}
                            </button>
                          ) : (
                            /* LÓGICA DE VENTA */
                            <>
                              {activeChatData?.ad_status === "disponible" && (
                                <button onClick={handleReserve} className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] text-zinc-300 hover:bg-zinc-800 text-left">
                                  <CalendarClock size={18} /> {t('chat.reserve_vehicle', "Reservar vehículo")}
                                </button>
                              )}
                              {activeChatData?.ad_status === "reservado" && (
                                <>
                                  <button onClick={openExtensionMenu} className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] text-blue-400 hover:bg-zinc-800 text-left">
                                    <CalendarPlus size={18} /> {t('chat.extend_reserve', "Ampliar reserva")}
                                  </button>
                                  <button onClick={handleCancelReserve} className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] text-orange-500 hover:bg-zinc-800 text-left">
                                    <X size={18} /> {t('chat.cancel_reserve', "Cancelar reserva")}
                                  </button>
                                </>
                              )}
                              {activeChatData?.ad_status !== "vendido" && (
                                <button onClick={handleConfirmSale} className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] text-green-500 hover:bg-zinc-800 text-left font-bold border-t border-zinc-800/50">
                                  <CheckCircle2 size={18} /> {t('chat.confirm_final_sale', "Confirmar venta final")}
                                </button>
                              )}
                            </>
                          )}
                          <div className="h-px bg-zinc-800 my-1"></div>
                        </>
                      )}
                      <button className="w-full px-5 py-3.5 flex items-center gap-3 text-[15px] text-red-500 hover:bg-red-950/20 transition text-left"><Ban size={18} /> {t('chat.block_user', "Bloquear usuario")}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL GESTIÓN RESERVAS ALQUILER */}
            {showRentManager && (
              <div className="absolute inset-0 z-60 bg-black/90 p-6 animate-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-2">
                    <CalendarDays className="text-red-600" /> {t('chat.rents_of', "Reservas de")} {activeChatData?.buyer_name}
                  </h3>
                  <button onClick={() => setShowRentManager(false)} className="text-zinc-400 hover:text-white"><X size={32} /></button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[80%]">
                  {loadingRents ? (
                    <div className="text-center p-12 text-zinc-500 italic animate-pulse">{t('chat.loading_rents', "Cargando reservas...")}</div>
                  ) : activeUserRents.length === 0 ? (
                    <div className="text-center p-12 bg-zinc-900 rounded-2xl text-zinc-500 font-bold border border-zinc-800 italic">{t('chat.no_active_rents', "No hay reservas activas para este usuario.")}</div>
                  ) : (
                    activeUserRents.map((rent) => (
                      <div key={rent.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center group hover:border-red-900/50 transition">
                        <div>
                          <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1">{t('chat.reserved_period', "Periodo Reservado")}</p>
                          <p className="text-lg font-bold text-white">
                            {t('chat.from_date', "Del")} {new Date(rent.start_date).toLocaleDateString()} {t('chat.to_date', "al")} {new Date(rent.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-red-500 font-black mt-1">{rent.total_price}{t('chat.total_currency', "€ total")}</p>
                        </div>
                        <button onClick={() => cancelRent(rent.id)} className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white p-3 rounded-xl transition flex items-center gap-2 font-bold uppercase text-xs">
                          <Trash2 size={18} /> {t('chat.cancel_reserve', "Cancelar Reserva")}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MODAL AMPLIAR RESERVA (VENTA) */}
            {showExtensionInput && (
              <div className="absolute inset-0 z-70 bg-black/90 p-6 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase italic text-white">{t('chat.extend_reserve', "Ampliar Reserva")}</h3>
                    <button onClick={() => setShowExtensionInput(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{t('chat.extend_reserve_desc', "Selecciona la nueva fecha y hora límite para la reserva de este vehículo.")}</p>
                  <input 
                    type="datetime-local" 
                    value={extensionDate}
                    onChange={(e) => setExtensionDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white mb-6 outline-none focus:border-blue-500 transition"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowExtensionInput(false)} className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition">{t('common.cancel', "Cancelar")}</button>
                    <button onClick={handleExtendReserve} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition shadow-lg">{t('common.confirm', "Confirmar")}</button>
                  </div>
                </div>
              </div>
            )}

            {/* ÁREA MENSAJES */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-zinc-950">
              {messages.map((msg) => {
                const isMe = String(msg.sender_id) === String(currentUserId);
                const isSystem = !msg.sender_id || String(msg.sender_id) === "0" || String(msg.sender_id) === "1" || String(msg.sender_id) === "2";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex flex-col items-center my-8 animate-in fade-in zoom-in duration-500">
                      <span className="text-[11px] text-zinc-500 uppercase font-black tracking-widest mb-2 italic">{t('chat.notification_from', "Notificación de")} {APP_NAME}</span>
                      {/* CORRECCIÓN 3: max-w-[480px] y mx-4 en vez de la clase errónea max-w-480px que rompía márgenes */}
                      <div className="bg-zinc-900 border border-red-900/40 text-zinc-200 text-[16px] px-6 py-5 md:px-8 md:py-6 rounded-2xl max-w-480px mx-4 w-full shadow-2xl leading-relaxed whitespace-pre-wrap mt-1 text-center">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} w-full animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 md:px-5 md:py-3 rounded-2xl ${isMe ? "bg-red-600 text-white rounded-tr-sm shadow-md" : "bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700 shadow-md"}`}>
                      <p className="text-[16px] md:text-[17px] leading-relaxed whitespace-pre-wrap font-medium wrap-break-words">{msg.content}</p>
                      <p className="text-[11px] mt-1.5 text-right opacity-60 font-bold">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VALORACIÓN */}
            {activeChatData?.chat_status === "sold" && String(currentUserId) === String(activeChatData?.buyer_id) && !hasReviewed && (
              <div className="mx-4 mb-4 p-6 md:p-8 bg-zinc-800 border-2 border-yellow-600/30 rounded-2xl text-center animate-in zoom-in shadow-2xl relative">
                <button onClick={() => handleFinalizeChat(activeChatId!)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                <h3 className="text-xl font-black uppercase italic mb-2 text-white">{t('chat.purchase_finished', "¡Compra finalizada!")}</h3>
                <p className="text-zinc-400 text-[13px] md:text-[14px] mb-5 uppercase tracking-widest px-2">{t('chat.rate_user', "Valora a")} {activeChatData?.seller_name} {t('chat.to_help_community', "para ayudar a la comunidad")}</p>
                <div className="flex justify-center gap-2 md:gap-4 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className={`transition-transform active:scale-90 ${rating >= s ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-zinc-700"}`}>
                      <Star size={36} fill={rating >= s ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea placeholder={t('chat.review_placeholder', "Cuéntanos cómo fue todo (opcional)...")} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-base mb-5 outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition" />
                <button onClick={submitReview} disabled={!rating || loadingReview} className="w-full py-3.5 bg-yellow-600 text-black text-[15px] font-black uppercase tracking-widest rounded-xl transition hover:bg-yellow-500 disabled:opacity-50 shadow-lg">
                  {loadingReview ? t('common.sending', "Enviando...") : t('chat.submit_review', "Enviar Valoración")}
                </button>
              </div>
            )}

            {/* PIE DE CHAT */}
            <div className="p-3 md:p-5 bg-zinc-900/80 border-t border-zinc-800 pb-safe">
              {activeChatData?.chat_status === "disabled" ? (
                <div className="flex justify-center">
                  <button onClick={handleDeleteChat} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-8 rounded-xl border border-zinc-700 transition w-full max-w-md shadow-lg italic tracking-wide uppercase text-xs md:text-sm">
                    {t('chat.car_sold_to_other', "Coche vendido a otro usuario - Eliminar Chat")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto w-full">
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('chat.write_message', "Escribe tu mensaje...")} rows={1}
                    style={{ minHeight: "52px", maxHeight: "140px" }}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 md:px-5 md:py-3.5 outline-none text-[16px] md:text-[17px] resize-none focus:border-red-600 transition shadow-inner" />
                  {/* CORRECCIÓN 4: w-[52px] h-[52px] y shrink-0 arregla la deformación extrema del botón de enviar en móviles */}
                  <button type="submit" disabled={!newMessage.trim()} className="bg-red-600 text-white w-52px h-52px shrink-0 rounded-full flex items-center justify-center hover:bg-red-500 transition disabled:opacity-50 shadow-md">
                    <Send size={22} className="ml-1" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center bg-zinc-950">
            <div className="h-28 w-28 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800/50 shadow-xl">
              <MessageSquare size={48} className="text-zinc-700" />
            </div>
            <h3 className="font-black uppercase italic text-zinc-400 text-2xl tracking-tighter">{t('chat.mailbox_title', "Buzón de Negociación")}</h3>
            <p className="max-w-sm text-[15px] mt-3 leading-relaxed">{t('chat.mailbox_desc', "Selecciona un chat lateral para empezar a hablar con el vendedor o gestionar tu compra.")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;