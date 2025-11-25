export type DeviceType =
  | "phone"
  | "computer"
  | "iot"
  | "router"
  | "other";

export interface NetworkInterface {
  type: "cellular" | "wifi" | "ethernet" | "bluetooth" | "other";
  description?: string;
}

export interface DeviceProfile {
  deviceId: string; // Law-N logical device id
  deviceType: DeviceType;

  vendor?: string;
  model?: string;

  os?: string;
  osVersion?: string;

  supportedGLayers: string[]; // e.g. ["4G", "5G"]

  networkInterfaces: NetworkInterface[];

  // Hardware-ish hints
  supportsMimo?: boolean;
  supportsBeamforming?: boolean;
  supportsNetworkSlicing?: boolean;

  // Region or regulatory meta if known
  regionCode?: string; // e.g. "BW", "US", "EU"
}
