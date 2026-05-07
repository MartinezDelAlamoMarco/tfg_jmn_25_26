import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Cookie, 
  Info, 
  Code, 
  Settings, 
  List, 
  CheckSquare, 
  Trash2, 
  Scale, 
  Mail 
} from "lucide-react";
import { APP_NAME } from "../../config";

export default function PoliticaCookies() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón Volver */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('details.go_back', 'Volver atrás')}</span>
        </Link>

        {/* Encabezado */}
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-bold text-white mb-2 italic tracking-tighter">
            {t('footer.cookies_policy', 'POLÍTICA DE COOKIES').toUpperCase()}
          </h1>
          <p className="text-zinc-500 text-sm italic">
            {t('legal.cookies.last_update', 'Esta política fue actualizada por última vez en Mayo de 2026.')}
          </p>
        </header>

        <section className="space-y-12 text-sm leading-relaxed">

          {/* 1. Introducción */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                1. {t('legal.cookies.s1_title', 'Introducción')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.cookies.s1_text', { app_name: APP_NAME })}
            </p>
          </article>

          {/* 2. ¿Qué son las cookies? */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                2. {t('legal.cookies.s2_title', '¿Qué son las cookies?')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.cookies.s2_text')}
            </p>
          </article>

          {/* 3. Scripts y Balizas */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Code className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                3. {t('legal.cookies.s3_title', 'Scripts y Balizas Web')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-3">
              <p><strong>{t('legal.cookies.s3_subtitle1', 'Scripts')}:</strong> {t('legal.cookies.s3_text1')}</p>
              <p><strong>{t('legal.cookies.s3_subtitle2', 'Balizas Web')}:</strong> {t('legal.cookies.s3_text2')}</p>
            </div>
          </article>

          {/* 4. Tipos de Cookies */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                4. {t('legal.cookies.s4_title', 'Tipos de Cookies')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-4">
              <div>
                <h3 className="text-white font-bold mb-1">4.1 {t('legal.cookies.s4_sub1', 'Técnicas o funcionales')}</h3>
                <p>{t('legal.cookies.s4_text1')}</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">4.2 {t('legal.cookies.s4_sub2', 'De estadísticas')}</h3>
                <p>{t('legal.cookies.s4_text2')}</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">4.3 {t('legal.cookies.s4_sub3', 'De marketing/seguimiento')}</h3>
                <p>{t('legal.cookies.s4_text3')}</p>
              </div>
            </div>
          </article>

          {/* 5. Cookies Usadas (Adaptado a TFG Redline Motors) */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <List className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                5. {t('legal.cookies.s5_title', 'Tecnologías de Almacenamiento Usadas')}
              </h2>
            </div>
            <div className="pl-9 ml-3">
              <div className="overflow-x-auto bg-zinc-900 rounded-lg border border-zinc-800">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-800/50 text-white uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">{t('legal.cookies.table_name', 'Nombre')}</th>
                      <th className="px-4 py-3">{t('legal.cookies.table_purpose', 'Propósito')}</th>
                      <th className="px-4 py-3">{t('legal.cookies.table_type', 'Tipo')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">auth_token / user</td>
                      <td className="px-4 py-3">{t('legal.cookies.table_desc1', 'Mantener la sesión del usuario de forma segura.')}</td>
                      <td className="px-4 py-3 text-red-500">{t('legal.cookies.table_func', 'Funcional')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">user_role</td>
                      <td className="px-4 py-3">{t('legal.cookies.table_desc2', 'Gestionar permisos de moderación.')}</td>
                      <td className="px-4 py-3 text-red-500">{t('legal.cookies.table_func', 'Funcional')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">i18nextLng</td>
                      <td className="px-4 py-3">{t('legal.cookies.table_desc3', 'Recordar el idioma seleccionado (ES/EN).')}</td>
                      <td className="px-4 py-3 text-red-500">{t('legal.cookies.table_func', 'Funcional')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">Google Identity</td>
                      <td className="px-4 py-3">{t('legal.cookies.table_desc4', 'Permitir el inicio de sesión rápido (SSO).')}</td>
                      <td className="px-4 py-3 text-blue-400">{t('legal.cookies.table_third', 'Terceros')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          {/* 6. Consentimiento */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                6. {t('legal.cookies.s6_title', 'Consentimiento')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.cookies.s6_text')}
            </p>
          </article>

          {/* 7. Borrado */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                7. {t('legal.cookies.s7_title', 'Activación, desactivación y borrado')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-3">
              <p>{t('legal.cookies.s7_p1')}</p>
              <p className="text-red-400 font-medium">{t('legal.cookies.s7_p2')}</p>
            </div>
          </article>

          {/* 8. Derechos */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                8. {t('legal.cookies.s8_title', 'Tus derechos con respecto a los datos')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-2">
              <p>{t('legal.cookies.s8_intro')}</p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-zinc-300">
                <li>{t('legal.cookies.s8_l1')}</li>
                <li>{t('legal.cookies.s8_l2')}</li>
                <li>{t('legal.cookies.s8_l3')}</li>
                <li>{t('legal.cookies.s8_l4')}</li>
                <li>{t('legal.cookies.s8_l5')}</li>
                <li>{t('legal.cookies.s8_l6')}</li>
              </ul>
            </div>
          </article>

          {/* 9. Contacto */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                9. {t('legal.cookies.s9_title', 'Datos de Contacto')}
              </h2>
            </div>
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 ml-3 pl-9">
              <p className="text-white font-bold">{APP_NAME} S.L.</p>
              <p className="text-zinc-400 mt-2">Rivas-Vaciamadrid, Madrid, España</p>
              <p className="text-zinc-400">Web: https://tfg-frontend-h7hs.onrender.com</p>
              <p className="text-zinc-400">Email: admin@redlinemotors.com</p>
            </div>
          </article>

        </section>
      </div>
    </div>
  );
}