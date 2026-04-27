import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { ShieldAlert, Eye, AlertTriangle } from "lucide-react";
import LoadingScreen from "../../components/LoadingScreen"; // <-- IMPORTACIÓN AÑADIDA

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
  const [reports, setReports] = useState<PriorityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
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

  // --- CAMBIO AQUÍ: Ahora usamos el componente LoadingScreen ---
  if (loading) {
    return <LoadingScreen message="Cargando incidencias..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div className="p-3 bg-red-600/20 rounded-xl">
            <ShieldAlert className="text-red-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Panel de Moderación</h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Gestión de denuncias y seguridad</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-bold tracking-widest border-b border-zinc-800">
                <th className="p-5">Urgencia</th>
                <th className="p-5">Vehículo / Anuncio</th>
                <th className="p-5">Motivo Principal</th>
                <th className="p-5">Última Denuncia</th>
                <th className="p-5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-500 italic">No hay reportes pendientes. ¡Plataforma limpia!</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.advertisement_id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase ${
                        report.total_reports >= 5 ? 'bg-red-600 text-white animate-pulse' : 
                        report.total_reports >= 3 ? 'bg-orange-600/20 text-orange-500 border border-orange-600/50' : 
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        <AlertTriangle size={12} />
                        {report.total_reports} {report.total_reports === 1 ? 'Reporte' : 'Reportes'}
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-white uppercase tracking-tight">
                        {report.advertisement.vehicle?.model?.brand?.name} {report.advertisement.vehicle?.model?.name}
                      </p>
                      <p className="text-zinc-500 text-[10px] font-mono">ID: #{report.advertisement_id}</p>
                    </td>
                    <td className="p-5">
                      <span className="text-zinc-300 font-medium">{report.report_type_name}</span>
                    </td>
                    <td className="p-5 text-zinc-500 text-sm">
                      {new Date(report.last_report_at).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => navigate(report.advertisement.is_rent ? `/alquiler/${report.advertisement_id}` : `/advertisement/${report.advertisement_id}`)}
                        className="inline-flex items-center gap-2 bg-white text-black hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-black uppercase text-xs transition-all active:scale-95"
                      >
                        <Eye size={14} />
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPanel;