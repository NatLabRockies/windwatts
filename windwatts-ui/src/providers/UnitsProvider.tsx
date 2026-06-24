import { useCallback, useMemo } from "react";
import { UnitsContext, defaultUnitValues } from "./UnitsContext";
import { StoredUnits } from "../types";
import { useLocalStorage } from "../hooks";

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [storedUnits, setUnits] = useLocalStorage<StoredUnits>(
    "units",
    defaultUnitValues
  );
  const units = useMemo(
    () => ({ ...defaultUnitValues, ...storedUnits }),
    [storedUnits]
  );

  const updateUnit = useCallback(
    (key: string, value: string) => {
      setUnits((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setUnits]
  );

  const updateUnits = useCallback(
    (newValues: StoredUnits) => {
      setUnits((prev) => ({
        ...prev,
        ...newValues,
      }));
    },
    [setUnits]
  );

  return (
    <UnitsContext.Provider value={{ units, setUnits, updateUnit, updateUnits }}>
      {children}
    </UnitsContext.Provider>
  );
}
