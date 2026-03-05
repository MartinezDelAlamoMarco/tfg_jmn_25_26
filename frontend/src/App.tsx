import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import { API_BASE_URL } from './config';

interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
}

function App() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]); // estado para los datos

  const handleGetVehiculos = () => {
    axios.get(`${API_BASE_URL}/vehiculos`)
      .then(res => {
        setVehiculos(res.data); // guardamos los datos en el estado
      })
      .catch(err => {
        console.error('Error al obtener vehículos:', err);
      });
  };

  const handleGetVehiculo = () => {
    let input_id = document.getElementById("search-id") as HTMLInputElement
    const id = input_id.value
    axios.get(`${API_BASE_URL}/vehiculos/${id}`)
      .then(res => {
        setVehiculos([res.data]); // guardamos los datos en el estado
      })
      .catch(err => {
        console.error('Error al obtener vehículos:', err);
      });
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p>Esto es una prueba</p>

      <button onClick={handleGetVehiculos}>
        Obtener todos
      </button>
      <p>
        <input id='search-id' type="text" placeholder='Id' />
        <button onClick={handleGetVehiculo}>
          Buscar
        </button>
      </p>

      <div>
        <h2>Vehículos</h2>
        <ul>
          {vehiculos.map(v => (
            <li key={v.id}>
              {v.marca} {v.modelo} - ${v.precio}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App