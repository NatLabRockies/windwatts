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

/** Serialised body sent to POST /{model}/production */
export interface ProductionRequestBody {
  lat: number;
  lng: number;
  height: number;
  period: string;
  turbine?: string;
  custom_power_curve?: {
    wind_speed: number[];
    turbine_output: number[];
  };
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
  yearSet?: "full" | "sample";
}

export interface CSVBatchExportRequest {
  gridLocations: GridLocation[];
  dataModel: DataModel;
  period: "hourly" | "monthly";
  turbine?: string;
  yearSet?: "full" | "sample";
}
