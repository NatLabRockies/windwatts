import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TURBINE } from "../constants";
import { idbDelete, idbGetAll, idbPut, STORES } from "../services/idb";
import type { CustomPowerCurve } from "../types";
import {
  fingerprintCustomCurve,
  matchSharedCustomCurve,
} from "../utils/turbine";

async function loadCustomCurves(): Promise<CustomPowerCurve[]> {
  const storedCurves = await idbGetAll<CustomPowerCurve>(
    STORES.CUSTOM_TURBINES
  );
  const curves = await Promise.all(
    storedCurves.map(async (curve) => {
      if (curve.fingerprint) return curve;
      const updated = {
        ...curve,
        fingerprint: await fingerprintCustomCurve(curve),
      };
      await idbPut(STORES.CUSTOM_TURBINES, updated).catch(console.error);
      return updated;
    })
  );
  return curves.sort((a, b) => a.createdAt - b.createdAt);
}

export function useCustomTurbines(
  initialTurbineId: string | undefined,
  onTurbineResolved: (requested: string, resolved: string) => void
) {
  const [customCurves, setCustomCurves] = useState<CustomPowerCurve[]>([]);
  const [ready, setReady] = useState(false);
  const [hasMultipleMatches, setHasMultipleMatches] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurves() {
      try {
        const curves = await loadCustomCurves();
        if (cancelled) return;
        setCustomCurves(curves);
        if (initialTurbineId) {
          const matches = matchSharedCustomCurve(initialTurbineId, curves);
          onTurbineResolved(
            initialTurbineId,
            matches[0]?.id ?? DEFAULT_TURBINE
          );
          setHasMultipleMatches(matches.length > 1);
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        if (initialTurbineId) {
          onTurbineResolved(initialTurbineId, DEFAULT_TURBINE);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void loadCurves();
    return () => {
      cancelled = true;
    };
  }, [initialTurbineId, onTurbineResolved]);

  const addCustomCurve = useCallback((curve: CustomPowerCurve) => {
    setCustomCurves((prev) => [...prev, curve]);
  }, []);

  const removeCustomCurve = useCallback((id: string) => {
    idbDelete(STORES.CUSTOM_TURBINES, id).catch(console.error);
    setCustomCurves((prev) => prev.filter((curve) => curve.id !== id));
  }, []);

  return {
    customCurves,
    addCustomCurve,
    removeCustomCurve,
    ready,
    hasMultipleMatches,
  };
}
