import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  if (!isAdminLoggedIn) {
    return <Navigate to="/advocate-login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;