
import React from "react"
import { Toaster as SonnerComponent } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerComponent>

const Toaster = ({ ...props }: ToasterProps) => {
  // Use a fixed theme instead of relying on theme context
  const theme = "light" 

  return (
    <SonnerComponent
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

// Re-export the toast function from sonner
import { toast } from "sonner"
export { Toaster, toast }

// Default export for easier imports
export default Toaster
