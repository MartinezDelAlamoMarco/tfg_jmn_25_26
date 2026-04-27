import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"

import Home from "../pages/nucleo/Home"
import Login from "../pages/nucleo/Login"
import Register from "../pages/nucleo/Register"
import PasswordRecovery from "../pages/nucleo/PasswordRecovery"
import CreateProfile from "../pages/nucleo/CreateProfile"
import VehicleDetail from "../pages/nucleo/VehicleDetail" 
import AdvertisementsScreen from "../pages/gestionVendedor/AdvertisementsScreen" 
import CreateAd from "../pages/gestionVendedor/CreateAd"
import EditAd from '../pages/gestionVendedor/EditAd'
import FavoritesScreen from "../pages/areaPersonal/FavoritesScreen"
import CreateAdRent from "../pages/gestionVendedor/CreateAdRent"
import RentScreen from "../pages/nucleo/RentScreen"
import RentDetail from "../pages/nucleo/RentDetail"
import Profile from "../pages/areaPersonal/GestionarPerfil"
import ReportAdvertisement from "../components/ReportAdvertisement"

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
          <Route path="/mis-anuncios" element={<AdvertisementsScreen />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/editar-anuncio/:id" element={<EditAd />} />
          <Route path="/favoritos" element={<FavoritesScreen />} />
          <Route path="/alquileres" element={<RentScreen />} />
          <Route path="/create-ad-rent" element={<CreateAdRent />} />
          <Route path="/alquiler/:id" element={<RentDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/anuncios/:id/reportar" element={<ReportAdvertisement />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}