# Project overview

Cross-platform remote control app (Android + iOS) for [LuminaSync Core](https://github.com/LuminaSync/LuminaSync-core). Lets users adjust display color settings from the phone without Alt+Tab during games.

## Ecosystem

| Repository | Role | License |
|------------|------|---------|
| [LuminaSync-core](https://github.com/LuminaSync/LuminaSync-core) | Windows engine + GUI | GPL-3.0 |
| [LuminaSync-mobile](https://github.com/LuminaSync/LuminaSync-mobile) | This repo | GPL-3.0 |
| [LuminaSync-PoC](https://github.com/LuminaSync/LuminaSync-PoC) | Archived validation | — |
| [LuminaSync-web](https://github.com/LuminaSync/LuminaSync-web) | Landing site (Vercel) | MIT |

## Communication model (planned)

- **Transport:** WebSocket over LAN (Wi‑Fi), not Bluetooth as the primary path on Windows.
- **Pairing:** QR code from the desktop app (`host`, `port`, session key).
- **Security:** AES-256 (Fernet) for message payloads; reject unsigned or wrong-key frames (local zero-trust).
- **Latency:** Persistent socket so slider changes apply in near real time.

Details: [ARCHITECTURE.md](ARCHITECTURE.md), [INTEGRATION.md](INTEGRATION.md).

## Conventions

- User-facing strings and code comments in **English**.
- [Conventional Commits](https://www.conventionalcommits.org/) — see [CONTRIBUTING.md](../CONTRIBUTING.md).
- Stack direction: **Expo / React Native** (TypeScript) unless the repo already contains Flutter.

## Core contract (do not break)

Profile fields match core `ColorProfile` / `profiles.json`:

- `vibrance` 0–100 (%)
- `brightness`, `contrast` — offset %
- `gamma` 0.4–2.8
- `hue` 0–359 (optional)

Desktop settings keys: `observer_enabled`, desktop color fields — see [INTEGRATION.md](INTEGRATION.md).

## Further reading

1. [ARCHITECTURE.md](ARCHITECTURE.md)
2. [INTEGRATION.md](INTEGRATION.md)
3. Core README and `profiles.json.example` on GitHub
