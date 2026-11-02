export interface PowerCurvePoint {
  ws: number;
  kw: number;
}

export interface CustomPowerCurve {
  id: string;
  name: string;
  data: PowerCurvePoint[];
  createdAt: number;
  fingerprint?: string;
  minHeight?: number; // Optional recommended min hub height (m)
  maxHeight?: number; // Optional recommended max hub height (m)
}
