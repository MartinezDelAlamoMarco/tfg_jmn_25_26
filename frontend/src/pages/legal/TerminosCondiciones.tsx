import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  FileSignature, 
  Search, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  ShieldAlert, 
  Scale 
} from "lucide-react";
import { APP_NAME } from "../../config";

export default function TerminosCondiciones() {
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
            {t('footer.terms', 'TÉRMINOS Y CONDICIONES').toUpperCase()}
          </h1>
          <p className="text-zinc-500 text-sm italic">
            {t('legal.terms.last_update', 'Última actualización: Mayo 2026')}
          </p>
        </header>

        <section className="space-y-12 text-sm leading-relaxed">

          {/* 1. Identificación */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <FileSignature className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                1. {t('legal.terms.s1_title', 'Identificación del Titular')}
              </h2>
            </div>
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 ml-3 pl-9">
              <ul className="space-y-2 text-zinc-400">
                <li><strong className="text-white">{t('legal.terms.s1_company', 'Razón Social')}:</strong> Redline Motors S.L. (Proyecto TFG)</li>
                <li><strong className="text-white">NIF:</strong> B12345678</li>
                <li><strong className="text-white">{t('legal.terms.s1_address', 'Domicilio')}:</strong> Rivas-Vaciamadrid , Madrid, España.</li>
                <li><strong className="text-white">Email:</strong> admin@redlinemotors.com</li>
              </ul>
            </div>
          </article>

          {/* 2. Objeto del Servicio */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Search className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                2. {t('legal.terms.s2_title', 'Objeto y Descripción del Servicio')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.terms.s2_text', { app_name: APP_NAME })}
            </p>
          </article>

          {/* 3. Precios */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                3. {t('legal.terms.s3_title', 'Precios e Impuestos')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-3">
              <p><strong>{t('legal.terms.s3_sub1', 'Precios')}:</strong> {t('legal.terms.s3_text1')}</p>
              <p><strong>{t('legal.terms.s3_sub2', 'Desglose')}:</strong> {t('legal.terms.s3_text2')}</p>
            </div>
          </article>

          {/* 4. Métodos de Pago */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                4. {t('legal.terms.s4_title', 'Métodos de Pago y Seguridad')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-3">
              <p>{t('legal.terms.s4_intro', { app_name: APP_NAME })}</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>{t('legal.terms.s4_sub1', 'Tarjeta de Crédito/Débito')}:</strong> {t('legal.terms.s4_text1')}</li>
                <li><strong>{t('legal.terms.s4_sub2', 'Transferencia Bancaria')}:</strong> {t('legal.terms.s4_text2')}</li>
              </ul>
            </div>
          </article>

          {/* 5. Entrega */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                5. {t('legal.terms.s5_title', 'Entrega y Activación')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.terms.s5_text')}
            </p>
          </article>

          {/* 6. Desistimiento */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                6. {t('legal.terms.s6_title', 'Derecho de Desistimiento')}
              </h2>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 ml-3 pl-9 space-y-4">
              <p className="text-zinc-400 italic">
                {t('legal.terms.s6_law')}
              </p>
              <p className="text-white font-medium border-l-2 border-red-600 pl-4">
                {t('legal.terms.s6_text')}
              </p>
            </div>
          </article>

          {/* 7. Responsabilidad */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                7. {t('legal.terms.s7_title', 'Responsabilidad y Uso')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.terms.s7_text', { app_name: APP_NAME })}
            </p>
          </article>

          {/* 8. Legislación */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                8. {t('legal.terms.s8_title', 'Legislación y Jurisdicción')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.terms.s8_text')}
            </p>
          </article>

        </section>
      </div>
    </div>
  );
}