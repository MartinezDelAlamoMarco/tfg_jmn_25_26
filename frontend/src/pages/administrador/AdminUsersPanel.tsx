import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, ShieldCheck, User, ShieldAlert } from "lucide-react";
import { API_BASE_URL, SUPER_ADMIN_EMAIL } from "../../config";

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<any[]>([]); // Inicializado como array vacío
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false); // Estado para controlar la carga
  const token = localStorage.getItem("auth_token");
  const SUPER_ADMIN = SUPER_ADMIN_EMAIL;

  const fetchUsers = async () => {
    setLoading(true); // Activamos la carga antes de la petición
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Estructura de datos según la paginación de Laravel
      const data = response.data.data || (Array.isArray(response.data) ? response.data : []);
      setUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
      setUsers([]); 
    } finally {
      setLoading(false); // Desactivamos la carga al finalizar (éxito o error)
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 500); // Debounce para no saturar la API
    return () => clearTimeout(timer);
  }, [search]);

  const toggleRole = async (user: any) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await axios.patch(`${API_BASE_URL}/admin/users/${user.id}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al cambiar rol");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("¿Eliminar usuario? Esta acción borrará todos sus anuncios y fotos. Es irreversible.")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador Superior */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o ID..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contenedor de la Tabla */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-black uppercase text-zinc-500">
              <th className="p-5">Usuario</th>
              <th className="p-5 text-center">Rol</th>
              <th className="p-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              /* ESTADO DE CARGA: Spinner animado */
              <tr>
                <td colSpan={3} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Sincronizando Base de Datos...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              /* ESTADO VACÍO: Si no hay resultados */
              <tr>
                <td colSpan={3} className="p-16 text-center text-zinc-500 italic">
                  No se han encontrado usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              /* LISTADO DE USUARIOS */
              users.map(user => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-red-500 transition-colors">{user.name}</span>
                      <span className="text-sm text-zinc-500">{user.email}</span>
                      <span className="text-[10px] font-mono text-zinc-600 mt-1 uppercase tracking-widest">ID: #{user.id}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                      {user.email !== SUPER_ADMIN ? (
                        <>
                          <button 
                            onClick={() => toggleRole(user)} 
                            className="p-2.5 bg-zinc-800 hover:bg-white hover:text-black rounded-xl transition-all shadow-lg active:scale-95"
                            title="Cambiar permisos"
                          >
                            {user.role === 'admin' ? <User size={18}/> : <ShieldCheck size={18}/>}
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)} 
                            className="p-2.5 bg-zinc-800 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20 shadow-inner shadow-red-900/10">
                          <ShieldAlert size={14} className="animate-pulse" /> CUENTA PROTEGIDA
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}