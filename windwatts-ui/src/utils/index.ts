import { MODEL_COORDINATES_BOUNDS } from "../constants";
import { DataModel } from "../types";

// Export URL parameter utilities
export * from "./urlParams";
export * from "./turbine";

export const getWindResource = (speed: number) => {
  return speed > 5 ? "High" : speed >= 3 ? "Moderate" : "Low";
};

// Base units matching API output
const BASE_UNITS: Record<string, string> = {
  windspeed: "m/s",
  energy: "kWh",
  power: "kW",
};

// Unit Converter
export const convertUnit = (
  value: number,
  type: string,
  toUnit: string,
  fromUnit?: string,
  valueOnly?: boolean,
  locale?: string
): string => {
  const baseUnit = BASE_UNITS[type] ?? toUnit;
  const from = fromUnit ?? baseUnit; // fallback to base unit

  let converted: number;
  if (type === "windspeed") {
    const toMs = from === "mph" ? value / 2.2369 : value;
    converted = toUnit === "mph" ? toMs * 2.2369 : toMs;
  } else if (type === "energy") {
    const toMWh = from === "MWh" ? value * 1000 : value;
    converted = toUnit === "MWh" ? toMWh / 1000 : toMWh;
  } else if (type === "power") {
    const toMW = from === "MW" ? value * 1000 : value;
    converted = toUnit === "MW" ? toMW / 1000 : toMW;
  } else {
    converted = value;
  }

  const result = formatNumber(converted, 1, locale ?? "en-US");
  return valueOnly ? result : `${result} ${toUnit}`;
};

// Loss helpers
export const percentToFactor = (percent: number): number => {
  const num = Number(percent);
  if (!Number.isFinite(num)) return 1;
  const clamped = Math.max(0, Math.min(100, num));
  return (100 - clamped) / 100;
};

export const roundToSignificantDigits = (
  value: number,
  significantDigits: number
): number => {
  const v = Number(value);
  const d = Number(significantDigits);
  if (!Number.isFinite(v) || !Number.isFinite(d) || d <= 0) return 0;
  if (v === 0) return 0;
  const power = Math.floor(Math.log10(Math.abs(v)));
  const scale = Math.pow(10, power - d + 1);
  return Math.round(v / scale) * scale;
};

export const applyLoss = (
  value: number,
  factor: number,
  options?: { mode?: "none" | "nearest" | "floor" | "sig"; digits?: number }
): number => {
  const v = Number(value);
  const f = Math.max(0, Math.min(1, Number(factor)));
  if (!Number.isFinite(v)) return 0;
  const raw = v * f;
  if (!options || options.mode === "none") return raw;
  if (options.mode === "nearest") {
    const digits = options.digits ?? 0;
    return Number.isFinite(digits) && digits > 0
      ? Number(raw.toFixed(digits))
      : Math.round(raw);
  }
  if (options.mode === "floor") {
    const digits = options.digits ?? 0;
    if (digits <= 0) return Math.floor(raw);
    const scale = Math.pow(10, digits);
    return Math.floor(raw * scale) / scale;
  }
  if (options.mode === "sig") {
    const digits = options.digits ?? 2;
    return roundToSignificantDigits(raw, digits);
  }
  return raw;
};

/**
 * Simple number formatting function. Only handles NUMBER types currently.
 *
 * @param {number} num number to format
 * @param {number} decimalPlaces number of decimal places to round to
 * @param {string} locale locale to use for formatting
 * @returns {string} formatted number as a string
 */
export const formatNumber = (
  num: number,
  decimalPlaces: number = 1,
  locale: string = "en-US"
): string => {
  if (!Number.isFinite(num)) throw new Error(`${num} is not a number`);

  const formattedNum = num.toFixed(decimalPlaces);

  return Number(formattedNum).toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

/**
 * Format a coordinate value to 3 decimal places.
 * Used consistently across UI display and filename generation.
 *
 * @param {number} coordinate latitude or longitude value
 * @returns {string} formatted coordinate string (e.g., "40.123")
 */
export const formatCoordinate = (coordinate: number): string => {
  return coordinate.toFixed(3);
};

export function isOutOfBounds(
  lat: number,
  lng: number,
  model: DataModel
): boolean {
  const bounds = MODEL_COORDINATES_BOUNDS[model];
  if (!bounds) return false;
  return (
    lat < bounds.minLat ||
    lat > bounds.maxLat ||
    lng < bounds.minLng ||
    lng > bounds.maxLng
  );
}

export function findNearestWindDirectionHeight(
  directionHeights: string[],
  hubHeight: number
): number {
  const heights = directionHeights.map((h) => parseInt(h, 10)).filter(Boolean);
  if (heights.length === 0) return hubHeight;
  return heights.reduce((closest, candidate) =>
    Math.abs(candidate - hubHeight) < Math.abs(closest - hubHeight)
      ? candidate
      : closest
  );
}

export function getOutOfBoundsMessage(
  lat: number | undefined,
  lng: number | undefined,
  model: DataModel
): string {
  if (lat === undefined || lng === undefined) {
    return "No location selected.";
  }
  const bounds = MODEL_COORDINATES_BOUNDS[model];
  if (!bounds) return "No bounds defined for this model.";
  return (
    `(${formatCoordinate(lat)}, ${formatCoordinate(lng)}) is outside the supported region for ${model.toUpperCase()}:\n` +
    `Lat: [${bounds.minLat} ~ ${bounds.maxLat}], Lng: [${bounds.minLng} ~ ${bounds.maxLng}]`
  );
}
