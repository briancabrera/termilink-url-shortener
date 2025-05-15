"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast
          key={id}
          {...props}
          className={`toast-container ${variant === "destructive" ? "toast-error" : variant === "success" ? "toast-success" : ""}`}
        >
          <div className="grid gap-1">
            {title && <ToastTitle className="toast-title">{title}</ToastTitle>}
            {description && <ToastDescription className="toast-description">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
