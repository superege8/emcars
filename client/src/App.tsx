import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CarsList from "./pages/CarsList";
import CarDetail from "./pages/CarDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SellCar from "./pages/SellCar";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import CarsAdminList from "./pages/admin/CarsAdminList";
import CarForm from "./pages/admin/CarForm";
import Leads from "./pages/admin/Leads";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  return (
    <Routes>
      {/* =========================
          OFFENTLIG SIDE
      ========================= */}

      <Route path="/" element={<Home />} />

      <Route path="/biler" element={<CarsList />} />

      {/* Bil-detaljeside
          Home linker til /biler/:slug */}
      <Route path="/biler/:slug" element={<CarDetail />} />

      <Route path="/om-os" element={<About />} />

      <Route path="/kontakt" element={<Contact />} />

      <Route path="/saelg-bil" element={<SellCar />} />

      {/* =========================
          ADMIN LOGIN
      ========================= */}

      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* =========================
          ADMIN
      ========================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /admin */}
        <Route
          index
          element={<Dashboard />}
        />

        {/* /admin/biler */}
        <Route
          path="biler"
          element={<CarsAdminList />}
        />

        {/* /admin/biler/ny */}
        <Route
          path="biler/ny"
          element={<CarForm />}
        />

        {/* /admin/biler/:id */}
        <Route
          path="biler/:id"
          element={<CarForm />}
        />

        {/* /admin/henvendelser */}
        <Route
          path="henvendelser"
          element={<Leads />}
        />
      </Route>
    </Routes>
  );
}