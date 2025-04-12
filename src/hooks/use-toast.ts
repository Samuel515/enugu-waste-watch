
// This file serves as a re-export to maintain compatibility with existing imports
// The Toast component now uses a 3-second timeout by default and shows the close button without hover
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const toast = ({ title, description, action, variant = "default" }: ToastProps) => {
  return sonnerToast[variant === "destructive" ? "error" : "success"](title, {
    description,
    action,
    duration: 3000, // 3 seconds timeout
    className: "toast-with-visible-close-button",
  });
};

export const useToast = () => {
  return {
    toast,
    // Include dummy dismiss function for compatibility
    dismiss: (toastId?: string) => {},
    toasts: [] as any[], // Empty array for compatibility
  };
};
