
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  ToastProvider,
} from "@/components/ui/toast"

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}

// Simplified provider that doesn't conflict with Radix UI
export function ToasterWithProvider() {
  return <Toaster />
}

export default ToasterWithProvider
