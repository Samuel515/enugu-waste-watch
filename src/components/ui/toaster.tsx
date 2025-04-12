
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Toaster as SonnerToaster } from 'sonner'
import "../ui/toast.css"

export function Toaster() {
  return (
    <SonnerToaster 
      closeButton
      duration={3000}
      position="bottom-right"
      toastOptions={{
        style: {
          "--toast-progress-bar": "3s"
        } as React.CSSProperties
      }}
    />
  )
}
