import { useEffect, useState } from 'react';

interface ImageCache {
  [key: string]: string;
}

export const useImagePreloader = (imagePaths: string[]) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [cachedImages, setCachedImages] = useState<ImageCache>({});

  useEffect(() => {
    const preloadImages = async () => {
      const cache: ImageCache = {};
      const loadedFromStorage: ImageCache = {};

      try {
        // Check localStorage for cached images
        imagePaths.forEach(path => {
          const cachedData = localStorage.getItem(`image_cache_${path}`);
          if (cachedData) {
            loadedFromStorage[path] = cachedData;
          }
        });

        // Load remaining images that aren't cached
        const imagesToLoad = imagePaths.filter(path => !loadedFromStorage[path]);
        
        if (imagesToLoad.length === 0) {
          setCachedImages(loadedFromStorage);
          setImagesLoaded(true);
          return;
        }

        const loadPromises = imagesToLoad.map(async (path) => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              // Convert image to base64 and store in localStorage
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              ctx?.drawImage(img, 0, 0);
              
              try {
                const dataURL = canvas.toDataURL('image/png', 0.8);
                localStorage.setItem(`image_cache_${path}`, dataURL);
                cache[path] = dataURL;
                resolve();
              } catch (error) {
                // If localStorage is full, just use the original path
                cache[path] = path;
                resolve();
              }
            };
            img.onerror = () => {
              cache[path] = path; // Fallback to original path
              resolve();
            };
            img.src = path;
          });
        });

        await Promise.all(loadPromises);
        
        // Combine cached and newly loaded images
        const allImages = { ...loadedFromStorage, ...cache };
        setCachedImages(allImages);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        // Fallback to original paths
        const fallbackCache: ImageCache = {};
        imagePaths.forEach(path => {
          fallbackCache[path] = path;
        });
        setCachedImages(fallbackCache);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, [imagePaths]);

  return { imagesLoaded, cachedImages };
};