import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  UserCheck, 
  Target, 
  FileText, 
  Clock, 
  Share2, 
  ShieldAlert, 
  AlertCircle, 
  Lock 
} from "lucide-react";
import { APP_NAME, SUPER_ADMIN_EMAIL } from "../../config";

export default function PoliticaPrivacidad() {
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
            {t('footer.privacy_policy', 'POLÍTICA DE PRIVACIDAD').toUpperCase()}
          </h1>
          <p className="text-zinc-500 text-sm italic">
            {t('legal.privacy.last_update', 'Última actualización: Mayo 2026')}
          </p>
        </header>

        <section className="space-y-12 text-sm leading-relaxed">

          {/* 1. Responsable */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                1. {t('legal.privacy.q1_title', '¿Quién es el responsable del tratamiento de tus datos?')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              <strong>{APP_NAME} S.L. {t('legal.notice.project_status', '(Proyecto TFG)')}</strong> {t('legal.privacy.q1_text')}
            </p>
          </article>

          {/* 2. Finalidad */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                2. {t('legal.privacy.q2_title', '¿Para qué tratamos tus datos personales?')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-2">
              <p>{t('legal.privacy.q2_intro')}</p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-zinc-300">
                <li>{t('legal.privacy.q2_l1')}</li>
                <li>{t('legal.privacy.q2_l2')}</li>
                <li>{t('legal.privacy.q2_l3')}</li>
                <li>{t('legal.privacy.q2_l4')}</li>
              </ul>
            </div>
          </article>

          {/* 3. Legitimación */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                3. {t('legal.privacy.q3_title', '¿Por qué motivo podemos tratar tus datos?')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-2">
              <p>{t('legal.privacy.q3_intro')}</p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-zinc-300">
                <li><strong>{t('legal.privacy.q3_l1_bold')}:</strong> {t('legal.privacy.q3_l1_text')}</li>
                <li><strong>{t('legal.privacy.q3_l2_bold')}:</strong> {t('legal.privacy.q3_l2_text')}</li>
              </ul>
            </div>
          </article>

          {/* 4. Conservación */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                4. {t('legal.privacy.q4_title', '¿Durante cuánto tiempo guardaremos tus datos?')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.privacy.q4_text')}
            </p>
          </article>

          {/* 5. Destinatarios */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                5. {t('legal.privacy.q5_title', '¿A quién facilitamos tus datos personales?')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.privacy.q5_text')}
            </p>
          </article>

          {/* 6. Derechos */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                6. {t('legal.privacy.q6_title', '¿Cuáles son tus derechos?')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-4">
              <p>{t('legal.privacy.q6_intro')}</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>{t('legal.privacy.q6_l1')}</li>
                <li>{t('legal.privacy.q6_l2')}</li>
                <li>{t('legal.privacy.q6_l3')}</li>
                <li>{t('legal.privacy.q6_l4')}</li>
              </ul>
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mt-4">
                <p className="font-bold text-white mb-2">{t('legal.privacy.q6_contact_title')}:</p>
                <p>{APP_NAME} – {t('legal.notice.address_val', 'Rivas-Vaciamadrid, Madrid, España')}.</p>
                <p>{t('legal.cookies.contact_email', 'Email')}: {SUPER_ADMIN_EMAIL}</p>
              </div>
            </div>
          </article>

          {/* 7. Obligatoriedad */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                7. {t('legal.privacy.q7_title', 'Carácter obligatorio de la información')}
              </h2>
            </div>
            <div className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3 space-y-3">
              <p>{t('legal.privacy.q7_p1')}</p>
              <p>{t('legal.privacy.q7_p2')}</p>
            </div>
          </article>

          {/* 8. Seguridad */}
          <article>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                8. {t('legal.privacy.q8_title', 'Medidas de Seguridad')}
              </h2>
            </div>
            <p className="text-zinc-400 pl-9 border-l-4 border-zinc-800 ml-3">
              {t('legal.privacy.q8_text')}
            </p>
          </article>

        </section>
      </div>
    </div>
  );
}