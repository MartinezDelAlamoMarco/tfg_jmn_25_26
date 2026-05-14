import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Lock, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Lógica de validación de requisitos
  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    match: password === passwordConfirmation && password !== ""
  };

  const isFormValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      await axios.post(`${API_BASE_URL}/reset-password`, {
        token: searchParams.get("token"),
        email: searchParams.get("email"),
        password: password,
        password_confirmation: passwordConfirmation
      });

      setStatus({ type: 'success', msg: t('reset_password.success_msg', "¡Contraseña actualizada con éxito! Redirigiendo al login...") });
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.error || t('reset_password.error_msg', "El enlace ha expirado o es inválido. Solicita uno nuevo.")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-900">
      <div className="max-w-md w-full bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-900/20 rounded-full">
              <ShieldCheck className="text-red-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">
            {t('reset_password.reset', "Restablecer")} <span className="text-red-600">{t('reset_password.password', "Contraseña")}</span>
          </h2>
          <p className="text-zinc-400 text-sm">{t('reset_password.subtitle', "Crea una nueva contraseña segura para tu cuenta.")}</p>
        </div>

        {status && (
          <div className={`p-4 rounded-lg mb-6 text-sm text-center animate-in fade-in duration-300 ${
            status.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-500' : 'bg-red-900/30 text-red-400 border border-red-500'
          }`}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t('reset_password.new_password', "Nueva contraseña")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-red-600 outline-none transition"
              required
            />
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder={t('reset_password.repeat_password', "Repite la contraseña")}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-red-600 outline-none transition"
              required
            />
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-lg grid grid-cols-2 gap-2 mt-4">
            <ValidationItem label={t('reset_password.char_length', "8+ caracteres")} met={validations.length} />
            <ValidationItem label={t('reset_password.uppercase', "Mayúscula")} met={validations.upper} />
            <ValidationItem label={t('reset_password.number', "Número")} met={validations.number} />
            <ValidationItem label={t('reset_password.symbol', "Símbolo (!@#)")} met={validations.special} />
            <ValidationItem label={t('reset_password.match', "Coinciden")} met={validations.match} />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-red-700 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-black uppercase py-3 rounded-lg transition mt-6 shadow-lg shadow-red-900/20"
          >
            {isSubmitting ? t('reset_password.updating', "Actualizando...") : t('reset_password.save_new_password', "Guardar nueva contraseña")}
          </button>
        </form>
      </div>
    </div>
  );
};

const ValidationItem = ({ label, met }: { label: string, met: boolean }) => (
  <div className={`flex items-center space-x-2 ${met ? 'text-green-500' : 'text-zinc-500'} transition-colors duration-300`}>
    {met ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0" />}
    <span className="text-[11px] font-bold uppercase">{label}</span>
  </div>
);

export default ResetPassword;