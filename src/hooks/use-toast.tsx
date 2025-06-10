
import * as React from "react"

// Simple toast interface that matches what our app expects
interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Create a simple toast context for basic functionality
const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
} | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    // Fallback implementation when context is not available
    return {
      toast: (props: ToastProps) => {
        console.log('Toast:', props);
        // Could implement browser notification or simple alert as fallback
      },
      dismiss: () => {},
      toasts: []
    };
  }
  
  return context;
};

// Simple toast function
export const toast = (props: ToastProps) => {
  console.log('Toast:', props);
};

// Simple provider that doesn't conflict with Radix UI
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleToast = React.useCallback((props: ToastProps) => {
    console.log('Toast triggered:', props);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: handleToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export type ToasterToast = ToastProps & { id: string };
