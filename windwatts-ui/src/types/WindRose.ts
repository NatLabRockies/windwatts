export interface WindRoseBin {
  label: string;
  min: number;
  max: number | null;
}

export interface WindRoseSector {
  direction: string;
  frequencies: number[];
}

export interface WindRoseResponse {
  speedBins: WindRoseBin[];
  sectors: WindRoseSector[];
  unit: string;
}
