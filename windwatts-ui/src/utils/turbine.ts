import type { CustomPowerCurve } from "../types";
import { TURBINE_LABEL, TURBINE_DATA } from "../constants";

/** Custom turbine IDs always start with "custom-" */
export const isCustomTurbineId = (id: string): boolean =>
  id.startsWith("custom-");

const FINGERPRINT_VERSION = "v1";
const CUSTOM_SHARE_ID_PATTERN = new RegExp(
  `^custom-${FINGERPRINT_VERSION}-([0-9a-f]{8})$`
);

export async function fingerprintCustomCurve(
  curve: CustomPowerCurve
): Promise<string> {
  const points = [...curve.data].sort((a, b) => a.ws - b.ws);
  const canonical = JSON.stringify({
    version: FINGERPRINT_VERSION,
    points: points.map(({ ws, kw }) => [ws, kw]),
    minHeight: curve.minHeight ?? null,
    maxHeight: curve.maxHeight ?? null,
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function customCurveShareId(curve: CustomPowerCurve): string | null {
  return curve.fingerprint
    ? `custom-${FINGERPRINT_VERSION}-${curve.fingerprint.slice(0, 8)}`
    : null;
}

export function matchSharedCustomCurve(
  turbineId: string,
  curves: CustomPowerCurve[]
): CustomPowerCurve[] {
  const match = CUSTOM_SHARE_ID_PATTERN.exec(turbineId);
  if (!match) return curves.filter((curve) => curve.id === turbineId);
  return curves
    .filter((curve) => curve.fingerprint?.startsWith(match[1]))
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

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
