import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface EmployeeProtectedRouteProps {
  children: ReactNode;
}

const EmployeeProtectedRoute = ({ children }: EmployeeProtectedRouteProps) => {
  const isEmployeeLoggedIn = localStorage.getItem("employeeLogin") === "true";

  if (!isEmployeeLoggedIn) {
    return <Navigate to="/advocate-login" replace />;
  }

  return <>{children}</>;
};

export default EmployeeProtectedRoute;