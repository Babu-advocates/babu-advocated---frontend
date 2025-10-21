import toast from "react-hot-toast";

// Centralized toast utilities for the entire application
// All toasts will appear at top-center with white background

export const showToast = {
  success: (message: string) => {
    return toast.success(message);
  },
  
  error: (message: string) => {
    return toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  custom: (message: string, options?: any) => {
    return toast(message, options);
  },

  // Quick toast for application submitted - 0.5s duration, positioned right
  quickToast: (message: string) => {
    const toastId = toast.success(message, {
      duration: 500,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '8px 12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    });
    
    // Auto dismiss after 500ms
    setTimeout(() => {
      toast.dismiss(toastId);
    }, 500);
    
    return toastId;
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },
};

// Export default toast for direct usage
export { toast as default };