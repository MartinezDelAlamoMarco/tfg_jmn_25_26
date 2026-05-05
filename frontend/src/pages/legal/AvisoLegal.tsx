import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck, Scale, Globe, Copyright } from "lucide-react";
import { APP_NAME } from "../../config";

export default function AvisoLegal() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón Volver con traducción de tu diccionario actual */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('details.go_back', 'Volver atrás')}</span>
        </Link>

        {/* Encabezado Dinámico */}
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-bold text-white mb-2 italic tracking-tighter">
            {t('footer.legal_notice', 'AVISO LEGAL').toUpperCase()}
          </h1>
          <p className="text-zinc-500 text-sm italic">
            {t('legal.notice.last_update', 'Última actualización: Mayo 2026')}
          </p>
        </header>

        <section className="space-y-12 text-sm leading-relaxed">
          
          {/* Introducción */}
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-xl">
            <p className="text-zinc-400">
              {t('legal.notice.intro', { app_name: APP_NAME })}
            </p>
          </div>

          {/* 1. Datos Identificativos */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                1. {t('legal.notice.section1_title', 'Datos Identificativos')}
              </h2>
            </div>
            <ul className="space-y-3 bg-zinc-900 p-6 rounded-lg border border-zinc-800 border-l-4 border-l-red-600">
              <li><strong className="text-white">{t('legal.notice.domain', 'Dominio')}:</strong> redlinemotors.com</li>
              <li><strong className="text-white">{t('legal.notice.trade_name', 'Nombre Comercial')}:</strong> {APP_NAME}</li>
              <li><strong className="text-white">{t('legal.notice.company_name', 'Razón Social')}:</strong> Redline Motors S.L. (Proyecto TFG)</li>
              <li><strong className="text-white">NIF:</strong> B12345678</li>
              <li><strong className="text-white">{t('legal.notice.address', 'Dirección')}:</strong> Rivas-Vaciamadrid, Madrid, España</li>
              <li><strong className="text-white">E-mail:</strong> admin@redlinemotors.com</li>
            </ul>
          </article>

          {/* 2. Propiedad Intelectual */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Copyright className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                2. {t('legal.notice.section2_title', 'Propiedad Intelectual')}
              </h2>
            </div>
            <div className="space-y-4 text-zinc-400 pl-9">
              <p>{t('legal.notice.intellectual_p1')}</p>
              <p>{t('legal.notice.intellectual_p2')}</p>
            </div>
          </article>

          {/* 3. Exención de Responsabilidad */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                3. {t('legal.notice.section3_title', 'Exención de Responsabilidades')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9">
              {t('legal.notice.disclaimer_text')}
            </p>
          </article>

          {/* 4. Jurisdicción */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                4. {t('legal.notice.section4_title', 'Ley Aplicable y Jurisdicción')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9">
              {t('legal.notice.jurisdiction_text')}
            </p>
          </article>

        </section>
      </div>
    </div>
  );
}