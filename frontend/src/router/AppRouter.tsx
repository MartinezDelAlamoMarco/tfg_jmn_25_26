import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"

import Home from "../pages/nucleo/Home"
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import PasswordRecovery from "../pages/auth/PasswordRecovery"
import ResetPassword from "../pages/auth/ResetPassword"
import CreateProfile from "../pages/nucleo/CreateProfile"
import VehicleDetail from "../pages/nucleo/VehicleDetail" 
import AdvertisementsScreen from "../pages/gestionVendedor/AdvertisementsScreen" 
import CreateAd from "../pages/gestionVendedor/CreateAd"
import EditAd from '../pages/gestionVendedor/EditAd'
import FavoritesScreen from "../pages/areaPersonal/FavoritesScreen"
import CreateAdRent from "../pages/gestionVendedor/CreateAdRent"
import RentScreen from "../pages/nucleo/RentScreen"
import RentDetail from "../pages/nucleo/RentDetail"
import SearchScreen from "../pages/nucleo/SearchScreen"
import Profile from "../pages/areaPersonal/GestionarPerfil"
import ReportAdvertisement from "../components/ReportAdvertisement"
import AdminDashboard from "../components/AdminDashboard" 
import ChatList from "../pages/nucleo/ChatList"
import ChatScreen from "../pages/nucleo/ChatScreen"


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<PasswordRecovery />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          <Route path="/admin/panel" element={<AdminDashboard />} />
          <Route path="/buscar" element={<SearchScreen />} />
          <Route path="/mis-mensajes" element={<ChatList />} />
          <Route path="/mensajes/:id" element={<ChatScreen />} />


        </Route>

      </Routes>
    </BrowserRouter>
  )
}