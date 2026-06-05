import { DataModel } from "./DataModel";
import { GridLocation } from "./GridLocation";
import { PowerCurvePoint } from "./CustomPowerCurve";

export type WindspeedPeriod = "all" | "annual" | "monthly" | "hourly";

export interface WindspeedByLatLngRequest {
  lat: number;
  lng: number;
  hubHeight: number;
  dataModel: DataModel;
}

export interface WindRoseRequest {
  gridIndex: string;
  height: number;
  dataModel: DataModel;
  sectors?: 4 | 8 | 16;
  bin?: number;
  calmThreshold?: number;
}

export interface EnergyProductionRequest {
  lat: number;
  lng: number;
  hubHeight: number;
  dataModel: DataModel;
  period?: string;
  turbine?: string; // Reference turbine ID
  customPowerCurve?: PowerCurvePoint[]; // Custom power curve data — takes precedence
}

export interface PowerCurveBody {
  wind_speed_ms: number[];
  turbine_output_kw: number[];
}

export interface ProductionRequestBody {
  lat: number;
  lng: number;
  height: number;
  period: string;
  turbine?: string;
  custom_power_curve?: PowerCurveBody;
}

export interface TimeseriesEnergyRequestBody {
  gridIndex: string;
  period: string;
  year_set?: string;
  turbine?: string;
  custom_power_curve?: PowerCurveBody;
}

export interface TimeseriesEnergyBatchRequestBody {
  locations: GridLocation[];
  period: string;
  year_set?: string;
  turbine?: string;
  custom_power_curve?: PowerCurveBody;
}

export interface NearestGridLocationRequest {
  lat: number;
  lng: number;
  n_neighbors?: number;
  dataModel: DataModel;
}

export interface CSVExportRequest {
  gridIndex: string;
  dataModel: DataModel;
  period: "hourly" | "monthly";
  turbine?: string;
  customPowerCurve?: PowerCurvePoint[];
  yearSet?: "full" | "sample";
}

export interface CSVBatchExportRequest {
  gridLocations: GridLocation[];
  dataModel: DataModel;
  period: "hourly" | "monthly";
  turbine?: string;
  customPowerCurve?: PowerCurvePoint[];
  yearSet?: "full" | "sample";
}
