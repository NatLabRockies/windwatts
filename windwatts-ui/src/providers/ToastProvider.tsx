import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Toast } from "../components/shared/Toast";
import { ToastContext } from "./ToastContext";
import type { ToastOptions } from "./ToastContext";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<
    (ToastOptions & { id: number }) | null
  >(null);
  const nextId = useRef(0);

  const showToast = useCallback((options: ToastOptions) => {
    setNotification({ ...options, id: ++nextId.current });
  }, []);
  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {notification && (
        <Toast
          key={notification.id}
          message={notification.message}
          severity={notification.severity}
          duration={notification.duration}
          onClose={() =>
            setNotification((current) =>
              current?.id === notification.id ? null : current
            )
          }
        />
      )}
    </ToastContext.Provider>
  );
}
