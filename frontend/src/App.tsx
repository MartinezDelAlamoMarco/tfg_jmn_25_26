import { useState } from "react";
import "./App.css";
import axios from "axios";
import { API_BASE_URL } from "./config";

interface Vehiculo {
  id: number;
  brand: string;
  model: string;
  price: number;
}

function App() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [searchId, setSearchId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // estado de carga

  const handleGetVehiculos = () => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles`)
      .then((res) => {
        setVehiculos(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setVehiculos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGetVehiculo = () => {
    if (!searchId) {
      alert("Introduce un ID");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles/${searchId}`)
      .then((res) => {
        setVehiculos([res.data]);
      })
      .catch((err) => {
        setVehiculos([]);
        if (err.response?.status === 404) {
          setErrorMessage("Vehículo no encontrado");
        } else {
          setErrorMessage("Error al obtener vehículo");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <h1 className="text-5xl font-bold underline mb-5">REDLINE MOTORS</h1>

      <button className="rounded-full" onClick={handleGetVehiculos}>Obtener todos</button>
        <div className="max-w-xl mx-auto p-6">
            <label className="text-sm font-medium">ID</label>
            <div className="flex items-center mt-1">
                <input type="text" className="w-full h-10 px-3 text-sm border border-r-0 rounded-r-none border-blue-500 focus:outline-none rounded shadow-sm" placeholder="Example: 1" value={searchId} onChange={(e) => setSearchId(e.target.value)}/>
                <button className="h-10 px-4 text-sm bg-blue-500 border border-l-0 border-blue-500 rounded-r shadow-sm text-blue-50 hover:text-white hover:bg-blue-400 hover:border-blue-400 focus:outline-none" onClick={handleGetVehiculo}>Buscar</button>
            </div>
        </div>
      <div>
        <h2 className="text-3xl font-bold underline mb-2">Vehículos</h2>
        {loading && <p>Cargando vehículos...</p>}{" "}
        {/* mostrar mientras carga */}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {!loading && !errorMessage && vehiculos.length === 0 && (
          <p>No hay vehículos disponibles</p>
        )}
        {!loading && vehiculos.length > 0 && (
          <ul>
            {vehiculos.map((v) => (
              <li key={v.id}>
                {v.brand} {v.model} - ${v.price}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
