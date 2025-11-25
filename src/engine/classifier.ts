import { DeviceProfile, DeviceType } from "../models/DeviceProfile";
import { GLayer, GLayerProfile } from "../models/GLayerProfile";
import sampleProfiles from "../data/sample-profiles.json";

export interface DeviceHints {
  userAgent?: string;
  hasCellularModem?: boolean;
  hasTouchScreen?: boolean;
  formFactor?: "phone" | "laptop" | "desktop" | "tablet" | "iot";
  vendor?: string;
  model?: string;
  regionCode?: string;
  supportedGLayers?: GLayer[];
}

export interface ContextHints {
  targetLatencyMs?: number;
  prioritizeBattery?: boolean;
  prioritizeThroughput?: boolean;
}

export function classifyDeviceType(hints: DeviceHints): DeviceType {
  if (hints.formFactor === "phone" || hints.hasCellularModem && hints.hasTouchScreen) {
    return "phone";
  }

  if (hints.formFactor === "laptop" || hints.formFactor === "desktop") {
    return "computer";
  }

  if (hints.formFactor === "iot") {
    return "iot";
  }

  return "other";
}

export function buildDeviceProfile(deviceId: string, hints: DeviceHints): DeviceProfile {
  const type = classifyDeviceType(hints);

  const supportedGLayers = hints.supportedGLayers?.map(String) ?? [];

  const networkInterfaces = [
    ...(hints.hasCellularModem ? [{ type: "cellular" as const }] : []),
    { type: "wifi" as const }
  ];

  return {
    deviceId,
    deviceType: type,
    vendor: hints.vendor,
    model: hints.model,
    os: hints.userAgent,
    supportedGLayers,
    networkInterfaces,
    regionCode: hints.regionCode,
    supportsMimo: supportedGLayers.includes("4G") || supportedGLayers.includes("5G"),
    supportsBeamforming: supportedGLayers.includes("5G"),
    supportsNetworkSlicing: supportedGLayers.includes("5G")
  };
}

export function estimateGLayerProfiles(profile: DeviceProfile): GLayerProfile[] {
  // This is intentionally simple — you’ll refine later or plug into N-LLMs.
  const baseProfiles: Record<GLayer, GLayerProfile> = {
    "1G": { gLayer: "1G", maxThroughputMbps: 0.01, typicalLatencyMs: 500 },
    "2G": { gLayer: "2G", maxThroughputMbps: 0.1, typicalLatencyMs: 300 },
    "3G": { gLayer: "3G", maxThroughputMbps: 2, typicalLatencyMs: 150 },
    "4G": { gLayer: "4G", maxThroughputMbps: 100, typicalLatencyMs: 60, supportsMimo: true },
    "5G": { gLayer: "5G", maxThroughputMbps: 1000, typicalLatencyMs: 10, supportsBeamforming: true, supportsNetworkSlicing: true },
    "6G": { gLayer: "6G", maxThroughputMbps: 10000, typicalLatencyMs: 1, supportsBeamforming: true, supportsNetworkSlicing: true }
  };

  return profile.supportedGLayers
    .filter((g): g is GLayer => ["1G", "2G", "3G", "4G", "5G", "6G"].includes(g))
    .map((g) => {
      const base = baseProfiles[g];
      const suitabilityScore =
        g === "5G" ? 0.95 :
        g === "4G" ? 0.85 :
        g === "3G" ? 0.6 :
        0.4;

      return {
        ...base,
        suitabilityScore
      };
    });
}

export function pickBestGLayer(
  profile: DeviceProfile,
  context: ContextHints = {}
): GLayerProfile | null {
  const candidates = estimateGLayerProfiles(profile);
  if (!candidates.length) return null;

  const { targetLatencyMs, prioritizeBattery, prioritizeThroughput } = context;

  return candidates
    .sort((a, b) => {
      let scoreA = a.suitabilityScore ?? 0;
      let scoreB = b.suitabilityScore ?? 0;

      if (targetLatencyMs != null) {
        const penaltyA = Math.abs(a.typicalLatencyMs - targetLatencyMs);
        const penaltyB = Math.abs(b.typicalLatencyMs - targetLatencyMs);
        scoreA -= penaltyA / 1000;
        scoreB -= penaltyB / 1000;
      }

      if (prioritizeThroughput) {
        scoreA += a.maxThroughputMbps / 10000;
        scoreB += b.maxThroughputMbps / 10000;
      }

      if (prioritizeBattery) {
        // crude: favor lower throughput = less power
        scoreA -= a.maxThroughputMbps / 10000;
        scoreB -= b.maxThroughputMbps / 10000;
      }

      return scoreB - scoreA;
    })[0];
}

// Expose sample profiles for quick experimentation
export const SAMPLE_PROFILES = sampleProfiles;
