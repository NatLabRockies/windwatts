import { DataModelInfo } from "../types";

export const DATA_MODEL_INFO: Record<string, DataModelInfo> = {
  "ensemble-quantiles": {
    label: "WindWatts Ensemble",
    source_href: "",
    help_href: "",
    description: "WindWatts Ensemble model (experimental)",
    year_range: "",
    wind_speed_heights: [],
    wind_direction_heights: [],
  },
  "era5-quantiles": {
    label: "ERA5 Reanalysis",
    source_href:
      "https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5",
    help_href: "https://github.com/NREL/windwatts/blob/main/docs/about/era5.md",
    description: "ERA5 (ECMWF Reanalysis v5) Dataset",
    year_range: "2013-2023",
    wind_speed_heights: ["10m", "30m", "40m", "50m", "60m", "80m", "100m"],
    wind_direction_heights: ["10m", "100m"],
  },
  "wtk-timeseries": {
    label: "NLR WTK-LED",
    source_href:
      "https://www.energy.gov/eere/wind/articles/new-wind-resource-database-includes-updated-wind-toolkit",
    help_href: "",
    description: "NLR's 20-year WTK-LED Dataset",
    year_range: "",
    wind_speed_heights: [],
    wind_direction_heights: [],
  },
};
