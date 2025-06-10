
import React from "react"
import { ToasterToast } from "./toast/types"
import { ToastContext, createToast } from "./toast/toast-context"

// Export useToast hook for components
export const useToast = () => {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    // Fallback for when context is not available
    return {
      toast: (props: Omit<ToasterToast, "id">) => createToast(props),
      dismiss: context?.dismiss || (() => {}),
      toasts: [] as ToasterToast[]
    }
  }
  
  return {
    ...context,
    toasts: context.state.toasts,
  }
}

// Standalone toast function
export const toast = (props: Omit<ToasterToast, "id">) => {
  return createToast(props)
}

// Re-export the ToastProvider
export { ToastProvider } from "./toast/toast-context"
export type { ToasterToast }
