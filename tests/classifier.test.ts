import { buildDeviceProfile, classifyDeviceType, pickBestGLayer } from "../src/engine/classifier";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error("Assertion failed: " + message);
  }
}

function testPhoneClassification() {
  const hints = {
    hasCellularModem: true,
    hasTouchScreen: true,
    formFactor: "phone" as const
  };

  const type = classifyDeviceType(hints);
  assert(type === "phone", `Expected phone, got ${type}`);

  const profile = buildDeviceProfile("test-phone", hints);
  assert(profile.deviceType === "phone", "Profile deviceType should be phone");
}

function testBestGLayer() {
  const hints = {
    hasCellularModem: true,
    hasTouchScreen: true,
    formFactor: "phone" as const,
    supportedGLayers: ["4G", "5G"] as const
  };

  const profile = buildDeviceProfile("test-phone-2", hints);
  const best = pickBestGLayer(profile, { targetLatencyMs: 20, prioritizeThroughput: true });

  if (!best) {
    throw new Error("Expected a best G-layer");
  }

  console.log("Best G-layer for test-phone-2:", best.gLayer);
}

function main() {
  console.log("Running classifier tests...");
  testPhoneClassification();
  testBestGLayer();
  console.log("All tests passed.");
}

main();
