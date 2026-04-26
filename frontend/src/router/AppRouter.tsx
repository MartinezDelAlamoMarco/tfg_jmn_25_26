import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"

// Páginas de Núcleo (Públicas)
import Home from "../pages/nucleo/Home"
import Login from "../pages/nucleo/Login"
import Register from "../pages/nucleo/Register"
import PasswordRecovery from "../pages/nucleo/PasswordRecovery"
import CreateProfile from "../pages/nucleo/CreateProfile"
import VehicleDetail from "../pages/nucleo/VehicleDetail" 
// 1. IMPORTAMOS LA NUEVA PANTALLA DE ALQUILER
import AlquilerScreen from "../pages/nucleo/AlquilerScreen" 
import CreateAdRent from "../pages/gestionVendedor/CreateAdRent"
import AdvertisementsScreen from "../pages/gestionVendedor/AdvertisementsScreen" 
import CreateAd from "../pages/gestionVendedor/CreateAd";
import EditAd from '../pages/gestionVendedor/EditAd';
import AlquilerDetailScreen from "../pages/gestionVendedor/AlquilerDetailScreen"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Todas las rutas dentro de MainLayout compartirán el mismo Navbar y Footer */}
        <Route element={<MainLayout />}>

          {/* Inicio y Auth */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/create-profile" element={<CreateProfile />} />

          {/* Flujo de Compra/Venta */}
          <Route path="/advertisement/:id" element={<VehicleDetail />} />
          <Route path="/mis-anuncios" element={<AdvertisementsScreen />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/editar-anuncio/:id" element={<EditAd />} />

          {/* Flujo de Alquiler (TFG) */}
          {/* 1. Catálogo de alquileres */}
          <Route path="/alquileres" element={<AlquilerScreen />} />
          
          {/* 2. Vista única de reserva de un coche */}
          <Route path="/alquiler/:id" element={<AlquilerDetailScreen />} />
          
          {/* 3. Formulario para que el vendedor publique un coche para alquilar */}
          <Route path="/create-rent" element={<CreateAdRent />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}