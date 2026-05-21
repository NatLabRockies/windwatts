import type { PowerCurvePoint } from "../types";

/**
 * Read a File as a UTF-8 text string.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

/**
 * Parse a power-curve CSV text into an array of PowerCurvePoint.
 *
 * Expected columns (case-insensitive):
 *  - "Wind Speed (m/s)", "Wind Speed", or "WS" for the wind speed column
 *  - "Turbine Output", "Power", or "kw" for the turbine output column
 * Rows with non-numeric values are silently skipped. Result is sorted ascending by wind speed.
 *
 * Throws if the header columns are missing or fewer than 2 valid rows
 * are found.
 */
export function parsePowerCurveCSV(text: string): PowerCurvePoint[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error(
      "CSV file must have a header row and at least one data row."
    );
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const wsIdx = header.findIndex(
    (h) =>
      h.includes("wind speed") ||
      h.includes("wind speed (m/s)") ||
      h.includes("ws")
  );
  const kwIdx = header.findIndex(
    (h) =>
      h.includes("turbine output") || h.includes("power") || h.includes("kw")
  );

  if (wsIdx === -1 || kwIdx === -1) {
    throw new Error(
      'CSV must contain columns "Wind Speed (m/s)" and "Turbine Output".'
    );
  }

  const points: PowerCurvePoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const ws = parseFloat(cols[wsIdx]);
    const kw = parseFloat(cols[kwIdx]);
    if (!isNaN(ws) && !isNaN(kw) && ws >= 0) {
      points.push({ ws, kw });
    }
  }

  if (points.length < 2) {
    throw new Error("CSV must contain at least 2 valid data rows.");
  }

  return points.sort((a, b) => a.ws - b.ws);
}
