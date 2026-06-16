export interface StoredUnits {
  windspeed: string;
  energy: string;
  power: string;
  [key: string]: string; // allow extension without breaking existing spread/merge patterns
}
