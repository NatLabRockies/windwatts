import { createContext } from "react";
import type { AlertColor } from "@mui/material";

export interface ToastOptions {
  message: string;
  severity?: AlertColor;
  duration?: number;
}

export const ToastContext = createContext<{
  showToast: (options: ToastOptions) => void;
} | null>(null);
