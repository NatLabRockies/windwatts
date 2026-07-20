import type { CustomPowerCurve } from "../types";
import { TURBINE_LABEL, TURBINE_DATA } from "../constants";

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
 * Returns the display label for a reference or custom turbine ID,
 * appending the recommended hub height range when available.
 */
export const getTurbineLabel = (
  turbineId: string,
  customCurves: CustomPowerCurve[],
  includeRange = true
): string => {
  const custom = customCurves.find((c) => c.id === turbineId);
  if (custom) {
    return includeRange &&
      custom.minHeight !== undefined &&
      custom.maxHeight !== undefined
      ? `${custom.name} (${custom.minHeight}-${custom.maxHeight}m)`
      : custom.name;
  }
  const info = TURBINE_DATA[turbineId];
  const base = TURBINE_LABEL[turbineId] ?? turbineId;
  return includeRange &&
    info?.minHeight !== undefined &&
    info?.maxHeight !== undefined
    ? `${base} (${info.minHeight}-${info.maxHeight}m)`
    : base;
};

/**
 * Parses an optional hub height string input into a number.
 * Returns undefined when the input is blank.
 */
export const parseOptionalHeight = (value: string): number | undefined => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
};

/**
 * Resolves a raw hub height value to a valid value for the given model.
 * - Interpolable model: clamps to [min, max] — no extrapolation.
 * - Non-interpolable model: clamps then snaps to the nearest available height.
 */
export const resolveHubHeight = (
  value: number,
  availableHeights: number[],
  interpolable: boolean
): number => {
  const min = Math.min(...availableHeights);
  const max = Math.max(...availableHeights);
  const clamped = Math.max(min, Math.min(max, value));
  if (interpolable) return clamped;
  return availableHeights.reduce((prev, curr) =>
    Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
  );
};

/**
 * Validates an optional hub height range.
 * Returns an error message string, or null when the values are valid.
 */
export const validateHubHeightRange = (
  min: number | undefined,
  max: number | undefined
): string | null => {
  if ((min !== undefined) !== (max !== undefined)) {
    return "Please enter both min and max hub heights, or leave both empty.";
  }
  if (min !== undefined && max !== undefined) {
    if (!Number.isFinite(min) || min <= 0) {
      return "Min hub height must be a positive number.";
    }
    if (!Number.isFinite(max) || max <= 0) {
      return "Max hub height must be a positive number.";
    }
    if (min >= max) {
      return "Min hub height must be less than max hub height.";
    }
  }
  return null;
};
