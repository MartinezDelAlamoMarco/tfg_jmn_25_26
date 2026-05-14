import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { ShieldAlert, Eye, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PriorityReport {
  advertisement_id: number;
  report_type_name: string;
  total_reports: number;
  last_report_at: string;
  advertisement: {
    is_rent: boolean;
    vehicle?: {
      model?: {
        name: string;
        brand?: { name: string };
      };
    };
  };
}

const AdminReportsPanel = () => {
  const { t, i18n } = useTranslation(); 
  const [reports, setReports] = useState<PriorityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true); 
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.get(`${API_BASE_URL}/admin/reports-priority`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(response.data);
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabecera interna del panel */}
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 bg-red-600/20 rounded-lg">
          <ShieldAlert className="text-red-500" size={20} />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight">{t('admin_panel.priority_reports', "Incidencias Prioritarias")}</h2>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/80 text-zinc-500 text-xs uppercase font-black tracking-widest border-b border-zinc-800">
              <th className="p-5">{t('admin_panel.urgency', "Urgencia")}</th> 
              <th className="p-5">{t('admin_panel.vehicle_ad', "Vehículo / Anuncio")}</th> 
              <th className="p-5">{t('admin_panel.reason', "Motivo")}</th> 
              <th className="p-5">{t('admin_panel.date', "Fecha")}</th> 
              <th className="p-5 text-right">{t('admin_panel.actions', "Acción")}</th> 
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              /* SPINNER INTEGRADO */
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{t('admin_panel.analyzing_reports', "Analizando Reportes...")}</span> 
                  </div>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-zinc-500 italic">{t('admin_panel.no_reports', "No hay reportes pendientes. ¡Plataforma limpia!")}</td> 
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.advertisement_id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      report.total_reports >= 5 ? 'bg-red-600 text-white animate-pulse' : 
                      report.total_reports >= 3 ? 'bg-orange-600/20 text-orange-500 border border-orange-600/50' : 
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      <AlertTriangle size={10} />
                      {report.total_reports} {report.total_reports === 1 ? t('admin_panel.report', 'Reporte') : t('admin_panel.reports', 'Reportes')}
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-white uppercase tracking-tight">
                      {report.advertisement.vehicle?.model?.brand?.name} {report.advertisement.vehicle?.model?.name}
                    </p>
                    <p className="text-zinc-500 text-[10px] font-mono">ID: #{report.advertisement_id}</p>
                  </td>
                  <td className="p-5">
                    <span className="text-zinc-300 font-medium text-sm">{report.report_type_name}</span>
                  </td>
                  <td className="p-5 text-zinc-500 text-sm">
                    {/* FORMATO DE FECHA DINÁMICO SEGÚN EL IDIOMA */}
                    {new Date(report.last_report_at).toLocaleDateString(i18n.language.startsWith('en') ? 'en-US' : 'es-ES')}
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => navigate(report.advertisement.is_rent ? `/alquiler/${report.advertisement_id}` : `/advertisement/${report.advertisement_id}`)}
                      className="inline-flex items-center gap-2 bg-zinc-800 text-white hover:bg-white hover:text-black px-4 py-2 rounded-lg font-black uppercase text-[10px] transition-all active:scale-95"
                    >
                      <Eye size={14} />
                      {t('admin_panel.review', "Revisar")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReportsPanel;