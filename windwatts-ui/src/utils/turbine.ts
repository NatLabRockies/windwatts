import type { CustomPowerCurve } from "../types";
import { TURBINE_LABEL } from "../constants";

/** Custom turbine IDs always start with "custom-" */
export const isCustomTurbineId = (id: string): boolean =>
  id.startsWith("custom-");

/**
 * Returns the CustomPowerCurve with Id
 */
export const resolveCustomCurve = (
  turbineId: string,
  customCurves: CustomPowerCurve[]
): CustomPowerCurve | null => {
  if (!isCustomTurbineId(turbineId)) return null;
  return customCurves.find((c) => c.id === turbineId) ?? null;
};

/**
 * Returns the display name for reference/ custom turbine ID.
 */
export const getTurbineLabel = (
  turbineId: string,
  customCurves: CustomPowerCurve[]
): string => {
  const custom = customCurves.find((c) => c.id === turbineId);
  if (custom) return custom.name;
  return TURBINE_LABEL[turbineId] ?? turbineId;
};
