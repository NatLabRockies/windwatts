type EnergyRow = Record<string, string | number | null>;

type NumericMap = Record<string, number>;
type NumericMapList = NumericMap[];
type AlphaNumeric = string | number;

export interface GlobalWindspeedResponse {
  global_avg: number;
}

export interface YearlyWindspeedResponse {
  yearly_avg: NumericMapList;
}

export interface MonthlyWindspeedResponse {
  monthly_avg: NumericMapList;
}

export interface HourlyWindspeedResponse {
  hourly_avg: NumericMapList;
}

export type WindspeedResponse =
  | GlobalWindspeedResponse
  | YearlyWindspeedResponse
  | MonthlyWindspeedResponse
  | HourlyWindspeedResponse;

export interface ModelInfoResponse {
  model: string;
  supported_periods: Record<string, string[]>;
  available_years: number[];
  sample_years: number[];
  available_heights: Record<string, number[]>;
  grid_info: Record<string, AlphaNumeric>;
  references: string[];
  links: string[];
}

export interface EnergyProductionResponse {
  summary_avg_energy_production?: Record<string, EnergyRow>;
  monthly_avg_energy_production?: Record<string, EnergyRow>;
  yearly_avg_energy_production?: Record<string, EnergyRow>;
  energy_production?: number;
}

export interface GridPointLocation {
  index: string;
  latitude?: number;
  longitude?: number;
}

export interface GridPointsResponse {
  locations: GridPointLocation[];
}

export interface AvailableTurbinesResponse {
  available_turbines: string[];
}

export interface RoseCalmInfo {
  calm_threshold: number;
  calm_fraction: number;
}

export interface RoseSectorInfo {
  sector_index: number;
  center_bearing_deg: number;
  from_deg: number;
  to_deg: number;
}

export interface RoseBinInfo {
  bin_index: number;
  bin_min: number;
  bin_max: number;
}

export interface RoseBinData {
  sector_index: number;
  bin_index: number;
  frequency: number;
  data: number[];
}

export interface WindRoseResponse {
  no_of_sectors: number;
  no_of_bins: number;
  calm_info: RoseCalmInfo;
  calm_data: number[];
  sector_info: RoseSectorInfo[];
  bin_info: RoseBinInfo[];
  bin_data: RoseBinData[];
}
