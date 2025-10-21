import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageLoader = () => {
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Don't show loader on homepage (/)
    if (location.pathname === '/') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFadeOut(false);
    
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 400);
    
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/15 backdrop-blur-sm transition-opacity duration-[600ms] ease-out"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="yin-yang-loader"></div>
      <div className="loading-text-container"></div>
    </div>
  );
};

export default PageLoader;


