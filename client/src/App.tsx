import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/biler" element={<CarsList />} />
        <Route path="/biler/:slug" element={<CarDetail />} />
        <Route path="/saelg-din-bil" element={<SellCar />} />
        <Route path="/om-os" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="biler" element={<CarsAdminList />} />
        <Route path="biler/ny" element={<CarForm />} />
        <Route path="biler/:id" element={<CarForm />} />
        <Route path="henvendelser" element={<Leads />} />
      </Route>

      <Route path="*" element={<div className="container-page py-24 text-center">Siden blev ikke fundet.</div>} />
    </Routes>
  );
}
