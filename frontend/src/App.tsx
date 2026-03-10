import { useState } from "react";
import "./App.css";
import axios from "axios";
import { API_BASE_URL } from "./config";
import { useEffect } from "react";

interface Brand {
  id: string,
  name: string,
}

interface Vehiculo {
  id: number;
  name: string;
  brand: Brand;
}

function App() {
  useEffect(() => {
    handleGetBrands();
  }, []);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehiculos, setVehicles] = useState<Vehiculo[]>([]);
  const [searchId, setSearchId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // estado de carga

  const handleGetBrands = () => {
    setErrorMessage(null);
    axios
      .get(`${API_BASE_URL}/brands`)
      .then((res) => {
        setBrands(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener las marcas");
        setBrands([]);
      })
  };

  const handleGetVehicles = () => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles`)
      .then((res) => {
        setVehicles(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setVehicles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGetVehiclesByBrand = (selectedBrandId: string) => {
    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles/brand/${selectedBrandId}`)
      .then((res) => {
        setVehicles(res.data);
      })
      .catch(() => {
        setErrorMessage("Error al obtener vehículos");
        setVehicles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGetVehicle = () => {
    if (!searchId) {
      alert("Introduce un ID");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vehicles/${searchId}`)
      .then((res) => {
        setVehicles([res.data]);
      })
      .catch((err) => {
        setVehicles([]);
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

      <button className="rounded-full" onClick={handleGetVehicles}>Obtener todos</button>
        <div className="max-w-xl mx-auto p-6">
            <label className="text-sm font-medium">ID</label>
            <div className="flex items-center mt-1">
                <input type="text" className="w-full h-10 px-3 text-sm border border-r-0 rounded-r-none border-blue-500 focus:outline-none rounded shadow-sm" placeholder="Example: 1" value={searchId} onChange={(e) => setSearchId(e.target.value)}/>
                <button className="h-10 px-4 text-sm bg-blue-500 border border-l-0 border-blue-500 rounded-r shadow-sm text-blue-50 hover:text-white hover:bg-blue-400 hover:border-blue-400 focus:outline-none" onClick={handleGetVehicle}>Buscar</button>
                <select onChange={
                  (e) => {
                    const  selected = e.target.value; 
                    setBrandId(selected); 
                    if (selected) {
                      handleGetVehiclesByBrand(selected)
                    } else {
                      handleGetVehicles()
                    }
                  }
                    } className="h-10 px-4 text-sm bg-blue-500 border border-l-0 border-blue-500 rounded-r shadow-sm text-blue-50 hover:text-white hover:bg-blue-400 hover:border-blue-400 focus:outline-none">
                  <option key="" value="">Todas las marcas</option>
                  {
                    brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))
                  }
                </select>
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
                {v.brand.name} {v.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
