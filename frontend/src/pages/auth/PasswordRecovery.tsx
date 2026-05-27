import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useTranslation } from "react-i18next"; 

const PasswordRecovery = () => {
  const { t } = useTranslation(); 
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      // Llamada a la nueva ruta que pusimos en api.php
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        t('password_recovery.error_send', "No se pudo enviar el correo. Inténtalo de nuevo.") 
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-900">
      <div className="max-w-md w-full">
        {/* Tarjeta Principal */}
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
              {t('password_recovery.recover', "Recuperar")} <span className="text-red-600">{t('password_recovery.password', "Contraseña")}</span> 
            </h2>
            <p className="text-zinc-400 text-sm">
              {t('password_recovery.subtitle', "Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu cuenta.")} 
            </p>
          </div>

          {message ? (
            /* Mensaje de Éxito */
            <div className="bg-green-900/30 border border-green-500 text-green-400 p-4 rounded-lg text-center mb-6 animate-in fade-in duration-500">
              <p className="font-medium">{message}</p>
              <p className="text-xs mt-2 text-green-500/80">{t('password_recovery.check_inbox', "Revisa tu bandeja de entrada (y spam).")}</p> 
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-xs font-black text-zinc-400 uppercase mb-2 ml-1">
                  {t('password_recovery.email_label', "Correo electrónico")} 
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-200"
                    placeholder={t('password_recovery.email_placeholder', "ejemplo@correo.com")} 
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-700 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-black uppercase py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  t('password_recovery.sending', "Enviando...") 
                ) : (
                  <>
                    <span>{t('password_recovery.send_link', "Enviar enlace")}</span> 
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Botón Volver */}
          <div className="mt-8 text-center border-t border-zinc-700 pt-6">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition duration-200 group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('password_recovery.back_to_login', "Volver al inicio de sesión")} 
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;