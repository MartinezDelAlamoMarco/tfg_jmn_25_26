import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface ReportType {
  id: number;
  name: string;
}

const ReportAdvertisement = () => {
  const { id } = useParams<{ id: string }>(); // ID del anuncio a reportar
  const navigate = useNavigate();
  
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Comprobar si el tipo seleccionado es "Otro" para mostrar el textarea
  const isOtherSelected = reportTypes.find(t => t.id === Number(selectedTypeId))?.name === 'Otro';

  useEffect(() => {
    // Obtener los tipos de reporte del backend
    const fetchReportTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/report-types`);
        setReportTypes(response.data);
      } catch (err) {
        setError("Error al cargar los motivos de reporte.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setError("Debes iniciar sesión para reportar un anuncio.");
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/reports`, {
        advertisement_id: id,
        report_type_id: selectedTypeId,
        description: isOtherSelected ? description : null,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMsg("Tu reporte ha sido enviado. Un administrador lo revisará pronto.");
    } catch (err: any) {
      // Manejar el error 422 de reporte duplicado que configuramos en Laravel
      if (err.response && err.response.status === 422) {
        setError(err.response.data.message || "Error al procesar el reporte.");
      } else {
        setError("Hubo un error al enviar el reporte. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Cargando...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center items-center">
      <div className="max-w-xl w-full bg-zinc-900 p-8 rounded-lg border border-zinc-800">
        <h1 className="text-2xl font-bold uppercase mb-2">Denunciar Anuncio</h1>
        <p className="text-zinc-400 mb-6 text-sm">Ayúdanos a mantener la comunidad segura. Selecciona el motivo de tu denuncia.</p>

        {successMsg ? (
          <div className="bg-green-900/50 border border-green-500 text-green-400 p-4 rounded mb-6">
            <p>{successMsg}</p>
            <button 
              onClick={() => navigate(`/advertisement/${id}`)}
              className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors w-full uppercase font-bold text-sm"
            >
              Volver al anuncio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-900/50 border border-red-500 text-red-400 p-3 rounded text-sm">{error}</div>}

            <div className="space-y-3">
              {reportTypes.map((type) => (
                <label key={type.id} className="flex items-center gap-3 cursor-pointer p-3 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={selectedTypeId === type.id}
                    onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                    className="w-4 h-4 text-red-500 bg-zinc-900 border-zinc-700 focus:ring-red-500"
                    required
                  />
                  <span className="font-semibold">{type.name}</span>
                </label>
              ))}
            </div>

            {isOtherSelected && (
              <div className="animate-fade-in">
                <label className="block text-sm uppercase font-bold text-zinc-500 mb-2">Por favor, especifica el motivo</label>
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-red-500 min-h-[100px]"
                  placeholder="Escribe los detalles aquí..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded uppercase text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || selectedTypeId === ""}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded uppercase text-sm transition-colors"
              >
                {submitting ? "Enviando..." : "Enviar Denuncia"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportAdvertisement;