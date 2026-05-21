# LuminaSync Mobile

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

Cross-platform companion app (**Android** and **iOS**) for [LuminaSync Core](https://github.com/LuminaSync/LuminaSync-core). Control monitor color settings from your phone while a game or app stays in focus on Windows — no Alt+Tab to open the desktop UI.

> **Status:** Planning / early development. The Windows engine is functional; this repository defines architecture, protocol, and contribution guidelines before the first Expo build lands.

## Why this exists

Tools that tweak vibrance and gamma are painful in fullscreen games. A phone-side remote is the main UX differentiator: sliders for **vibrance, brightness, contrast, gamma, and hue** with near real-time feedback on the PC.

## How it will work

1. Open LuminaSync on Windows and start **Pair phone**.
2. Scan the on-screen **QR code** with this app (contains LAN host, port, and a session key).
3. The app opens a **WebSocket** to the PC on your Wi‑Fi network.
4. Commands are **encrypted** (AES-256 / Fernet) so other devices on the LAN cannot read or forge adjustments.
5. Drag sliders on the phone; the monitor updates immediately.

We use **LAN + WebSockets** instead of Bluetooth as the primary path: lower latency for continuous slider input and a reliable Python server story on Windows. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the security model and protocol.

## Planned stack

| Layer | Choice |
|-------|--------|
| Mobile | **Expo / React Native** (TypeScript) — one codebase for Android and iOS |
| Desktop server | Python in LuminaSync-core (`websockets`, `qrcode`, `cryptography`) |
| Pairing | QR JSON: host, port, Fernet key |
| Alternative | Flutter is viable if the team prefers Dart; pick one stack and document it in the README when the scaffold is added |

## Ecosystem

| Repository | Purpose |
|------------|---------|
| [LuminaSync-core](https://github.com/LuminaSync/LuminaSync-core) | Windows engine + GUI (GPL-3.0) |
| [LuminaSync-mobile](https://github.com/LuminaSync/LuminaSync-mobile) | This repo (GPL-3.0) |
| [LuminaSync-PoC](https://github.com/LuminaSync/LuminaSync-PoC) | Archived Win11/NVAPI validation |
| [LuminaSync-web](https://github.com/LuminaSync/LuminaSync-web) | Landing page + downloads (MIT) |

## Documentation

| Document | Content |
|----------|---------|
| [docs/PROJECT.md](docs/PROJECT.md) | Ecosystem and conventions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | WebSocket, QR pairing, encryption, commands |
| [docs/INTEGRATION.md](docs/INTEGRATION.md) | JSON contract shared with core |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Commits, PRs, code style |

## Requirements (upcoming)

- Android or iOS device on the **same local network** as the PC
- LuminaSync Core with remote server enabled (feature in core roadmap)
- Camera permission for QR pairing

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for commit conventions and PR expectations.

## License

GPL-3.0 — see [LICENSE](LICENSE). Compatible with LuminaSync-core; the public website repo uses MIT separately.
