import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LitigationAccessProtectedRouteProps {
  children: ReactNode;
}

const LitigationAccessProtectedRoute = ({ children }: LitigationAccessProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLitigationAccessLoggedIn = localStorage.getItem('litigationAccessLogin') === 'true';
    
    if (!isLitigationAccessLoggedIn) {
      navigate('/bank-login', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LitigationAccessProtectedRoute;
