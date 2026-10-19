import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import type { AlertColor } from "@mui/material";
import { SNACKBAR_DURATION_SUCCESS } from "../../constants/ui";

interface ToastProps {
  message: string;
  onClose?: () => void;
  severity?: AlertColor;
  duration?: number;
}

export function Toast({
  message,
  onClose,
  severity = "info",
  duration = SNACKBAR_DURATION_SUCCESS,
}: ToastProps) {
  const [open, setOpen] = useState(true);

  const dismiss = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={(_event, reason) => {
        if (reason !== "clickaway") dismiss();
      }}
    >
      <Alert
        severity={severity}
        onClose={dismiss}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
