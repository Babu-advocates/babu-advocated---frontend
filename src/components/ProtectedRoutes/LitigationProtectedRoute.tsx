import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LitigationProtectedRouteProps {
  children: ReactNode;
}

const LitigationProtectedRoute = ({ children }: LitigationProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLitigationLoggedIn = localStorage.getItem('litigationLogin') === 'true';
    
    if (!isLitigationLoggedIn) {
      navigate('/advocate-login', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LitigationProtectedRoute;
