export interface PowerCurvePoint {
  ws: number;
  kw: number;
}

export interface CustomPowerCurve {
  id: string;
  name: string;
  data: PowerCurvePoint[];
  createdAt: number;
}
