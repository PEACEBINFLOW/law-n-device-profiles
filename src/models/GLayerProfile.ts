export type GLayer =
  | "1G"
  | "2G"
  | "3G"
  | "4G"
  | "5G"
  | "6G";

export interface GLayerProfile {
  gLayer: GLayer;

  maxThroughputMbps: number;
  typicalLatencyMs: number;

  // Rough estimate for energy cost per MB transmitted
  energyCostPerMb?: number;

  supportsBeamforming?: boolean;
  supportsNetworkSlicing?: boolean;

  // Qualitative signal for Law-N / CLSI
  suitabilityScore?: number; // 0..1
}
