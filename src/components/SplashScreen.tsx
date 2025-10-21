import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <img 
          src="https://supabaseforbabu.techverseinfo.tech/storage/v1/object/public/assets//BABU%20SIR%20LOADING%20UPDATED.png"
          alt="Babu Advocates Loading"
          className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto'
          }}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    </div>
  );
};

export default SplashScreen;