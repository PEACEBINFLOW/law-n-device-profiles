# Law-N Device Profiles 🟪

TypeScript library and schemas for **Law-N device & G-layer profiles**.

This repo answers one core question:

> “Given this device and its radio/network capabilities, how does it look under Law-N?”

It’s the bridge between raw hardware / OS info and:

- **Law-N core spec** (`law-n-core-spec`)
- **CLSI** placement decisions
- **N-SQL** tables like `network.devices` and `network.capabilities`

---

## 🔌 What This Repo Provides

### 1. Device Profile Model

Defined in `src/models/DeviceProfile.ts`:

- `deviceId` – internal Law-N ID for the device
- `deviceType` – `"phone" | "computer" | "iot" | "router" | "other"`
- `vendor` / `model`
- `os` / `osVersion`
- supported **G-layers** (`["4G", "5G"]`, etc)
- radio capabilities (bands, MIMO support, etc)
- network interfaces (cellular, wifi, ethernet)

---

### 2. G-Layer Profile Model

Defined in `src/models/GLayerProfile.ts`:

Describes how a **G-layer** behaves for this device:

- `gLayer` – `"1G" | "2G" | ... | "6G"`
- `maxThroughputMbps`
- `typicalLatencyMs`
- `energyCostPerMb`
- `supportsBeamforming`
- `supportsNetworkSlicing`

These will align with **GLCS** in `law-n-core-spec`.

---

### 3. Classification Engine

In `src/engine/classifier.ts`:

- `classifyDeviceFromHints(hints)` – classify a device as phone/computer/iot/etc
- `buildDeviceProfile(hints)` – construct a full `DeviceProfile` object
- `estimateBestGLayer(profile, context)` – pick the best G-layer for a use case

You can plug this into:

- a **CLSI edge worker** deciding where to run workloads
- a **tower simulator** deciding how to serve different classes of devices
- **N-SQL ingest pipelines** that normalize device data on the way in

---

## 🧪 Examples

Check `examples/classify-device.ts`:

```bash
npm install
npm run build
node dist/examples/classify-device.js
