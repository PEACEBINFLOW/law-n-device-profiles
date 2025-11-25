import { buildDeviceProfile, pickBestGLayer } from "../src/engine/classifier";

async function main() {
  const phoneHints = {
    hasCellularModem: true,
    hasTouchScreen: true,
    formFactor: "phone" as const,
    vendor: "ExampleVendor",
    model: "XV-5G",
    regionCode: "BW",
    supportedGLayers: ["4G", "5G"] as const
  };

  const profile = buildDeviceProfile("demo-phone", phoneHints);

  console.log("=== Law-N Device Profile ===");
  console.log(JSON.stringify(profile, null, 2));

  const bestForLowLatency = pickBestGLayer(profile, {
    targetLatencyMs: 15,
    prioritizeThroughput: true
  });

  console.log("\n=== Best G-Layer for Low-Latency Use ===");
  console.log(bestForLowLatency);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
