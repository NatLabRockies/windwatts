import React from "react";
import { SettingsProvider } from "./SettingsProvider";
import { UnitsProvider } from "./UnitsProvider";
import { ToastProvider } from "./ToastProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <UnitsProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </UnitsProvider>
    </ToastProvider>
  );
};
