import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react"; // Importamos los iconos
import { useTranslation } from "react-i18next"; 

export default function Profile() {
  const { t } = useTranslation(); 
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [token] = useState(localStorage.getItem("auth_token"));

  // Estados para el formulario de datos
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [telephone, setTelephone] = useState(user.telephone || "");
  const [profileMessage, setProfileMessage] = useState("");

  // Estados para el formulario de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Estados para el "ojito" (visibilidad de contraseñas)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para la validación de la contraseña en tiempo real
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false,
  });

  // Efecto para validar la contraseña cada vez que el usuario escribe
  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword === confirmPassword && newPassword.length > 0,
    });
  }, [newPassword, confirmPassword]);

  // Verificar si el formulario de contraseña es válido para habilitar el botón
  const isPasswordValid = Object.values(validations).every(Boolean) && currentPassword.length > 0;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    
    try {
      const response = await fetch("http://localhost:8000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, telephone }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage(t('profile.success_profile', "Perfil actualizado con éxito.")); 
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setProfileMessage(data.message || t('profile.error_profile', "Error al actualizar el perfil.")); 
      }
    } catch (error) {
      setProfileMessage(t('profile.connection_error', "Error de conexión.")); 
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return; // Doble seguridad por si manipulan el DOM

    setPasswordMessage("");
    setPasswordError("");

    try {
      const response = await fetch("http://localhost:8000/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          current_password: currentPassword, 
          password: newPassword, 
          password_confirmation: confirmPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage(t('profile.success_password', "Contraseña actualizada con éxito.")); 
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || data.message || t('profile.error_password', "Error al actualizar la contraseña.")); 
      }
    } catch (error) {
      setPasswordError(t('profile.connection_error', "Error de conexión.")); 
    }
  };

  // Componente auxiliar para renderizar los requisitos de validación
  const ValidationItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${isValid ? 'text-green-500' : 'text-zinc-500'}`}>
      {isValid ? <Check size={16} /> : <X size={16} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-zinc-900 border border-zinc-800 rounded-xl text-white">
      <h1 className="text-3xl font-bold mb-8 border-b border-zinc-700 pb-4">{t('profile.manage_profile', "Gestionar Mi Perfil")}</h1> 

      <div className="grid md:grid-cols-2 gap-12">
        {/* Formulario de Datos Personales */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-red-500">{t('profile.personal_data', "Datos Personales")}</h2> 
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-1">{t('profile.name', "Nombre")}</label> 
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" required />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">{t('profile.email', "Correo Electrónico")}</label> 
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" required />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">{t('profile.telephone', "Teléfono")}</label> 
              <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} 
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" />
            </div>
            {profileMessage && <p className={`text-sm ${profileMessage.includes("Error") ? "text-red-500" : "text-green-500"}`}>{profileMessage}</p>}
            <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full">
              {t('profile.save_changes', "Guardar Cambios")} 
            </button>
          </form>
        </div>

        {/* Formulario de Contraseña */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-red-500">{t('profile.change_password', "Cambiar Contraseña")}</h2> 
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            
            {/* Contraseña Actual */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1">{t('profile.current_password', "Contraseña Actual")}</label> 
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  className="w-full pl-4 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1">{t('profile.new_password', "Nueva Contraseña")}</label> 
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full pl-4 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Validaciones en tiempo real */}
            {newPassword.length > 0 && (
              <div className="bg-zinc-800/50 p-3 rounded-lg space-y-1 mt-2 border border-zinc-700/50">
                <ValidationItem isValid={validations.length} text={t('profile.min_length', "Mínimo 8 caracteres")} /> 
                <ValidationItem isValid={validations.uppercase} text={t('profile.uppercase', "Al menos una mayúscula")} /> 
                <ValidationItem isValid={validations.lowercase} text={t('profile.lowercase', "Al menos una minúscula")} /> 
                <ValidationItem isValid={validations.number} text={t('profile.number', "Al menos un número")} /> 
                <ValidationItem isValid={validations.special} text={t('profile.special', "Al menos un carácter especial")} /> 
              </div>
            )}

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-zinc-400 text-sm mb-1">{t('profile.confirm_new_password', "Confirmar Nueva Contraseña")}</label> 
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className={`w-full pl-4 pr-10 py-2 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all
                    ${confirmPassword.length > 0 
                      ? (validations.match ? 'border-green-500/50 focus:ring-green-500' : 'border-red-500/50 focus:ring-red-500') 
                      : 'border-zinc-700 focus:ring-red-500'}`} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !validations.match && (
                <p className="text-red-500 text-xs mt-1">{t('profile.passwords_not_match', "Las contraseñas no coinciden.")}</p> 
              )}
            </div>

            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordMessage && <p className="text-green-500 text-sm">{passwordMessage}</p>}
            
            <button 
              type="submit" 
              disabled={!isPasswordValid}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${isPasswordValid 
                  ? 'bg-red-700 hover:bg-red-600 text-white cursor-pointer' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}
            >
              {t('profile.update_password', "Actualizar Contraseña")} 
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}