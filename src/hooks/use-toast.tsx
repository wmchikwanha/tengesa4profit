
import React from "react"
import { ToastContext, createToast } from "./toast/toast-context"

export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    // Fallback implementation when context is not available
    return {
      toast: (props: any) => {
        console.warn('Toast context not available, using fallback');
        return { id: '', dismiss: () => {}, update: () => {} };
      },
      dismiss: () => {},
      toasts: []
    };
  }
  
  return {
    toast: context.toast,
    dismiss: context.dismiss,
    toasts: context.state.toasts
  };
};

// Simple toast function for direct use
export const toast = (props: any) => {
  return createToast(props);
};

// Re-export types
export type { ToasterToast } from "./toast/types";
