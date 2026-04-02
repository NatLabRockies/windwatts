import { useMemo } from "react";
import { applyLoss } from "../utils";
import {
  KEY_AVERAGE_YEAR,
  KEY_HIGHEST_YEAR,
  KEY_KWH_PRODUCED,
  KEY_LOWEST_YEAR,
} from "../constants";
import type { EnergyProductionResponse } from "../types";

type EnergyRow = Record<string, string | number | null>;

export function useLossAdjustedProductionData(
  data: EnergyProductionResponse | undefined,
  lossAssumptionFactor: number
): EnergyProductionResponse | undefined {
  return useMemo(() => {
    if (!data) return undefined;
    try {
      const clone: EnergyProductionResponse = structuredClone
        ? structuredClone(data)
        : JSON.parse(JSON.stringify(data));

      const summary = clone.summary_avg_energy_production;
      if (summary) {
        [KEY_AVERAGE_YEAR, KEY_LOWEST_YEAR, KEY_HIGHEST_YEAR].forEach(
          (k: string) => {
            const row = summary[k] as EnergyRow | undefined;
            if (row && row[KEY_KWH_PRODUCED] != null) {
              row[KEY_KWH_PRODUCED] = applyLoss(
                Number(row[KEY_KWH_PRODUCED]),
                lossAssumptionFactor,
                { mode: "floor" }
              );
            }
          }
        );
      }

      const coerceAndApply = (obj: Record<string, EnergyRow>) => {
        Object.keys(obj).forEach((key) => {
          const row = obj[key];
          if (!row) return;
          if (row[KEY_KWH_PRODUCED] != null) {
            row[KEY_KWH_PRODUCED] = applyLoss(
              Number(row[KEY_KWH_PRODUCED]),
              lossAssumptionFactor,
              { mode: "floor" }
            );
          }
        });
      };

      if (clone.monthly_avg_energy_production) {
        coerceAndApply(clone.monthly_avg_energy_production);
      }
      if (clone.yearly_avg_energy_production) {
        coerceAndApply(clone.yearly_avg_energy_production);
      }

      return clone;
    } catch {
      return data;
    }
  }, [data, lossAssumptionFactor]);
}
