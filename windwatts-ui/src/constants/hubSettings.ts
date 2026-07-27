import { DataModel, Heights } from "../types";

export const HUB_HEIGHTS: Record<DataModel | "default", Heights> = {
  "era5-quantiles": { values: [30, 40, 50, 60, 80, 100], interpolation: true },
  "wtk-timeseries": {
    values: [40, 60, 80, 100, 120, 140],
    interpolation: true,
  },
  "ensemble-quantiles": {
    values: [30, 40, 50, 60, 80, 100],
    interpolation: true,
  },
  "era5-timeseries": { values: [30, 40, 50, 60, 80, 100], interpolation: true },
  default: { values: [40, 60, 80, 100], interpolation: false },
};
