import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface BankEmployeeProtectedRouteProps {
  children: ReactNode;
}

const BankEmployeeProtectedRoute = ({ children }: BankEmployeeProtectedRouteProps) => {
  const isBankEmployeeLoggedIn = localStorage.getItem("bankEmployeeLogin") === "true";

  if (!isBankEmployeeLoggedIn) {
    return <Navigate to="/bank-login" replace />;
  }

  return <>{children}</>;
};

export default BankEmployeeProtectedRoute;