export interface Point {
  id: string;
  lat: number;
  lng: number;
}

export interface PointMeta extends Point {
  source?: 'click' | 'geoguessr-json' | 'simple-json';
  panoId?: string | null;
  countryCode?: string | null;
  stateCode?: string | null;
  raw?: unknown;
}

export interface ExpectationSettings {
  K: number;
  maxSamples?: number;
}

export interface ExpectationResult {
  bestLat: number;
  bestLng: number;
  bestScore: number;
}

export interface HeatmapSample {
  lat: number;
  lng: number;
  value: number;
}
