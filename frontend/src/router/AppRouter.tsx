import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"

import Home from "../pages/nucleo/Home"
import Login from "../pages/nucleo/Login"
import Register from "../pages/nucleo/Register"
import PasswordRecovery from "../pages/nucleo/PasswordRecovery"
import CreateProfile from "../pages/nucleo/CreateProfile"
import VehicleDetail from "../pages/nucleo/VehicleDetail" // Importamos el nuevo componente

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
          <Route path="/vehicle/:id" element={<VehicleDetail />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}