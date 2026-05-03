import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from "../../config"
import axios from "axios";
// Importamos los iconos de ojo y ojo-tachado
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'; // <-- IMPRESCINDIBLE

const Register = () => {
  const { t } = useTranslation(); // <-- IMPRESCINDIBLE
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Nuevos estados para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/register', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      })
      const { token, user } = response.data

      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Configurar el token por defecto para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Redirigir al inicio silenciosamente (recargando para actualizar el Navbar)
      window.location.href = '/'
    } catch (error) {
      console.error('Error en registro:', error)
      alert(t('register.error_register', 'Error en registro')) // <-- MODIFICADO CON t()
    }
  }

  // Objeto con las validaciones de la contraseña
  const passwordValidations = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  };

  // Comprobamos si la contraseña cumple TODOS los requisitos
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  
  // Comprobamos si ambas contraseñas coinciden
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('register.create_account', 'Crear cuenta')}</h1> {/* <-- MODIFICADO CON t() */}
            <p className="text-zinc-400">{t('register.join', 'Únete a')} {APP_NAME}</p> {/* <-- MODIFICADO CON t() */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-2">
                  {t('register.first_name', 'Nombre')} {/* <-- MODIFICADO CON t() */}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-2">
                  {t('register.last_name', 'Apellido')} {/* <-- MODIFICADO CON t() */}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                {t('register.email', 'Correo electrónico')} {/* <-- MODIFICADO CON t() */}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* CAMPO DE CONTRASEÑA CON LA VALIDACIÓN VISUAL Y EL BOTÓN DE OJITO */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                {t('register.password', 'Contraseña')} {/* <-- MODIFICADO CON t() */}
              </label>
              <div className="relative">
                <input
                  // El tipo cambia entre 'password' y 'text' según el estado
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                  required
                />
                {/* Botón del ojito posicionado absolutamente a la derecha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition duration-150"
                  aria-label={showPassword ? t('register.hide_password', 'Ocultar contraseña') : t('register.show_password', 'Ver contraseña')} // <-- MODIFICADO CON t()
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Feedback visual de validación (se mantiene igual) */}
              <div className="mt-3 text-sm space-y-1">
                <p className={`${passwordValidations.length ? 'text-green-500' : 'text-zinc-500'} transition-colors duration-200 flex items-center gap-2`}>
                  {passwordValidations.length ? '✓' : '○'} {t('register.min_length', 'Mínimo 8 caracteres')} {/* <-- MODIFICADO CON t() */}
                </p>
                <p className={`${passwordValidations.upper ? 'text-green-500' : 'text-zinc-500'} transition-colors duration-200 flex items-center gap-2`}>
                  {passwordValidations.upper ? '✓' : '○'} {t('register.uppercase', 'Al menos una mayúscula')} {/* <-- MODIFICADO CON t() */}
                </p>
                <p className={`${passwordValidations.lower ? 'text-green-500' : 'text-zinc-500'} transition-colors duration-200 flex items-center gap-2`}>
                  {passwordValidations.lower ? '✓' : '○'} {t('register.lowercase', 'Al menos una minúscula')} {/* <-- MODIFICADO CON t() */}
                </p>
                <p className={`${passwordValidations.number ? 'text-green-500' : 'text-zinc-500'} transition-colors duration-200 flex items-center gap-2`}>
                  {passwordValidations.number ? '✓' : '○'} {t('register.number', 'Al menos un número')} {/* <-- MODIFICADO CON t() */}
                </p>
                <p className={`${passwordValidations.special ? 'text-green-500' : 'text-zinc-500'} transition-colors duration-200 flex items-center gap-2`}>
                  {passwordValidations.special ? '✓' : '○'} {t('register.special', 'Al menos un carácter especial')} {/* <-- MODIFICADO CON t() */}
                </p>
              </div>
            </div>

            {/* CONFIRMAR CONTRASEÑA CON EL BOTÓN DE OJITO */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                {t('register.confirm_password', 'Confirmar contraseña')} {/* <-- MODIFICADO CON t() */}
              </label>
              <div className="relative">
                <input
                  // El tipo cambia entre 'password' y 'text' según el estado
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  // Si hay texto escrito y no coinciden, mostramos el borde en rojo
                  className={`w-full px-4 py-3 bg-zinc-700 border ${formData.confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500' : 'border-zinc-600'} rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200`}
                  placeholder="••••••••"
                  required
                />
                {/* Botón del ojito para confirmación */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition duration-150"
                  aria-label={showConfirmPassword ? t('register.hide_password', 'Ocultar contraseña') : t('register.show_password', 'Ver contraseña')} // <-- MODIFICADO CON t()
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Mensaje de error si no coinciden las contraseñas */}
              {formData.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-2">{t('register.passwords_not_match', 'Las contraseñas no coinciden')}</p> // <-- MODIFICADO CON t()
              )}
            </div>

            {/* BOTÓN DESHABILITADO SI FALLAN REQUISITOS */}
            <button
              type="submit"
              disabled={!isPasswordValid || !passwordsMatch}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
                !isPasswordValid || !passwordsMatch
                  ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                  : 'bg-red-700 hover:bg-red-600 text-white'
              }`}
            >
              {t('register.create_account', 'Crear cuenta')} {/* <-- MODIFICADO CON t() */}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              {t('register.already_have_account', '¿Ya tienes cuenta?')} {/* <-- MODIFICADO CON t() */}{' '}
              <Link to="/login" className="text-red-500 hover:text-red-400 font-medium transition duration-200">
                {t('register.login', 'Inicia sesión')} {/* <-- MODIFICADO CON t() */}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register