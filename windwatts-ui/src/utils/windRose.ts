import {
  WIND_ROSE_DIRECTIONS_16,
  WIND_ROSE_DIRECTIONS_8,
  WIND_ROSE_DIRECTIONS_4,
} from "../constants";

export function getWindRoseDirectionLabel(
  centerBearingDeg: number,
  noOfSectors: number
): string {
  const directions =
    noOfSectors === 16
      ? WIND_ROSE_DIRECTIONS_16
      : noOfSectors === 8
        ? WIND_ROSE_DIRECTIONS_8
        : WIND_ROSE_DIRECTIONS_4;

  const step = 360 / noOfSectors;
  const index = Math.round(centerBearingDeg / step) % noOfSectors;
  return directions[index];
}

export function toPercent(fraction: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(fraction * 100 * factor) / factor;
}
