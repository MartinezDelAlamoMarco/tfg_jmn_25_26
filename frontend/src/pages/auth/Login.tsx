import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, APP_NAME } from "../../config";
import LoadingScreen from "../../components/LoadingScreen"; // Importamos tu nuevo componente
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- IMPRESCINDIBLE

const Login = () => {
  const { t } = useTranslation(); // <-- IMPRESCINDIBLE
  const autoPart = APP_NAME.slice(0, 6);
  const marketPart = APP_NAME.slice(6);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Estado para la ruletita
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true); // Arrancamos la carga

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      const { token, user } = response.data;

      // Guardamos los datos de sesión
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // <-- NUEVO: Guardamos el rol específicamente para que lo lean los detalles del anuncio -->
      localStorage.setItem("user_role", user.role);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      window.location.href = "/";
    } catch (error) {
      setIsLoggingIn(false); // Paramos la carga si falla
      alert(t('login.invalid_credentials', "Credenciales inválidas")); // <-- MODIFICADO CON t()
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      function handleCredentialResponse(response: any) {
        // 1. Ya sabemos que llega el token, ahora lo enviamos al backend
        setIsLoggingIn(true); // Activamos tu ruletita de carga

        axios
          .post(`${API_BASE_URL}/auth/google`, {
            credential: response.credential,
          })
          .then((res) => {
            // 2. Laravel nos devuelve el usuario y el token de Sanctum
            const { token, user } = res.data;

            // 3. Guardamos todo exactamente igual que en tu login tradicional
            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("user_role", user.role);

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // 4. Redirigimos al inicio
            window.location.href = "/";
          })
          .catch((error) => {
            setIsLoggingIn(false);
            console.error("Error en el backend de Laravel:", error);
            alert(t('login.google_error', "Hubo un problema al validar el usuario con el servidor.")); // <-- MODIFICADO CON t()
          });
      }

      (window as any).google.accounts.id.initialize({
        client_id:
          "149796331998-vtk76a410khcd0qtb4d8ka88n02cgn8s.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" },
      );
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [t]);

  // Si estamos en proceso de login, mostramos la ruletita
  if (isLoggingIn) {
    return <LoadingScreen message={t('login.validating', "Validando credenciales...")} />; // <-- MODIFICADO CON t()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 italic uppercase tracking-tighter">
              {autoPart}
            <span className="text-red-700">{marketPart}</span>
            </h1>
            <p className="text-zinc-400">{t('login.sign_in_title', "Inicia sesión en tu cuenta")}</p> {/* <-- MODIFICADO CON t() */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                {t('login.email', "Correo electrónico")} {/* <-- MODIFICADO CON t() */}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                {t('login.password', "Contraseña")} {/* <-- MODIFICADO CON t() */}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition duration-150"
                  aria-label={
                    showPassword ? t('login.hide_password', "Ocultar contraseña") : t('login.show_password', "Ver contraseña") // <-- MODIFICADO CON t()
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-600 text-white font-black uppercase py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-red-900/20 active:scale-95"
            >
              {t('login.sign_in_btn', "Iniciar sesión")} {/* <-- MODIFICADO CON t() */}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-800 text-zinc-400 font-bold uppercase italic">
                {t('login.or', "O")} {/* <-- MODIFICADO CON t() */}
              </span>
            </div>
          </div>

          <div id="buttonDiv" className="w-full flex justify-center"></div>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              <Link
                to="/recovery"
                className="text-red-500 hover:text-red-400 font-bold transition duration-200"
              >
                {t('login.forgot_password', "¿Olvidaste tu contraseña?")} {/* <-- MODIFICADO CON t() */}
              </Link>
            </p>
            <p className="text-zinc-400">
              {t('login.no_account', "¿No tienes cuenta?")}{" "} {/* <-- MODIFICADO CON t() */}
              <Link
                to="/register"
                className="text-red-500 hover:text-red-400 font-bold transition duration-200"
              >
                {t('login.register', "REGÍSTRATE")} {/* <-- MODIFICADO CON t() */}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;