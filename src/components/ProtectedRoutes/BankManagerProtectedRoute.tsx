import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface BankManagerProtectedRouteProps {
  children: ReactNode;
}

const BankManagerProtectedRoute = ({ children }: BankManagerProtectedRouteProps) => {
  const isBankManagerLoggedIn = localStorage.getItem("bankManagerLogin") === "true";

  if (!isBankManagerLoggedIn) {
    return <Navigate to="/bank-login" replace />;
  }

  return <>{children}</>;
};

export default BankManagerProtectedRoute;