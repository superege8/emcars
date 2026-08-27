import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-ink/50">Indlæser...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
