import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"

import Home from "../pages/nucleo/Home"
import Login from "../pages/nucleo/Login"
import Register from "../pages/nucleo/Register"
import PasswordRecovery from "../pages/nucleo/PasswordRecovery"
import CreateProfile from "../pages/nucleo/CreateProfile"
import VehicleDetail from "../pages/nucleo/VehicleDetail" 
// 1. IMPORTAMOS LA NUEVA PANTALLA DE ALQUILER
import AlquilerScreen from "../pages/gestionVendedor/AlquilerScreen" 

import AdvertisementsScreen from "../pages/gestionVendedor/AdvertisementsScreen" 
import CreateAd from "../pages/gestionVendedor/CreateAd";
import EditAd from '../pages/gestionVendedor/EditAd';
import AlquilerDetailScreen from "../pages/gestionVendedor/AlquilerDetailScreen"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/advertisement/:id" element={<VehicleDetail />} />
          
          {/* 2. AÑADIMOS LA RUTA DE ALQUILER */}
          {/* Usamos :id para saber qué coche se quiere alquilar al entrar */}
          <Route path="/alquileres" element={<AlquilerScreen />} />
          <Route path="/alquiler/:id" element={<AlquilerDetailScreen />} />

          <Route path="/mis-anuncios" element={<AdvertisementsScreen />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/editar-anuncio/:id" element={<EditAd />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}