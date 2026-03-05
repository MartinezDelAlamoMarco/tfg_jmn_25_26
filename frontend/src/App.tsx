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
      <h1>REDLINE MOTORS</h1>

      <button onClick={handleGetVehiculos}>Obtener todos</button>
      <p>
        <input
          type="text"
          placeholder="Id"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button onClick={handleGetVehiculo}>Buscar</button>
      </p>

      <div>
        <h2>Vehículos</h2>

        {loading && <p>Cargando vehículos...</p>} {/* ✅ mostrar mientras carga */}
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