import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
    isActive
      ? "bg-accent/10 text-accent font-medium"
      : "text-white/55 hover:bg-white/[0.04] hover:text-white"
  }`;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-[#0f0f11] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 bg-[#0b0b0d] text-white flex flex-col border-r border-white/10">

        {/* LOGO / TITLE */}
        <div className="p-6 border-b border-white/10">
          <div className="text-xl font-semibold tracking-tight">
            EM<span className="text-accent">Cars</span>
          </div>

          <div className="text-xs text-white/35 mt-1">
            Admin-panel
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1">

          <NavLink
            to="/admin"
            end
            className={linkClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/biler"
            className={linkClass}
          >
            Biler
          </NavLink>

          <NavLink
            to="/admin/biler/ny"
            className={linkClass}
          >
            + Tilføj bil
          </NavLink>

          <NavLink
            to="/admin/henvendelser"
            className={linkClass}
          >
            Henvendelser
          </NavLink>

        </nav>

        {/* USER */}
        <div className="p-4 border-t border-white/10">

          <p className="text-xs text-white/45 mb-2 truncate">
            {user?.name}
          </p>

          <p className="text-[11px] text-white/25 mb-3 truncate">
            {user?.email}
          </p>

          <button
            onClick={handleLogout}
            className="text-sm text-white/55 hover:text-accent transition-colors"
          >
            Log ud
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 bg-[#131316] p-8">
        <Outlet />
      </main>

    </div>
  );
}