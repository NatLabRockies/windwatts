import { DataModel } from "./DataModel";
import { GridLocation } from "./GridLocation";

export interface WindspeedByLatLngRequest {
  lat: number;
  lng: number;
  hubHeight: number;
  dataModel: DataModel;
}

export interface EnergyProductionRequest {
  lat: number;
  lng: number;
  hubHeight: number;
  powerCurve: string;
  dataModel: DataModel;
  period?: string;
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
}

export interface CSVBatchExportRequest {
  gridLocations: GridLocation[];
  dataModel: DataModel;
  period: "hourly" | "monthly";
  turbine?: string;
}
