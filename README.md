# LuminaSync Mobile

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

Android and iOS remote for [LuminaSync Core](https://github.com/LuminaSync/LuminaSync-core). Adjust vibrance, brightness, contrast, gamma, and hue over **encrypted LAN WebSocket** — no cloud, no account.

## Security

- **Zero trust LAN** — Fernet-encrypted frames; pairing key from QR or paste only.
- **Zero data leakage** — no analytics, no backend; secrets in `expo-secure-store` only.

See [docs/SECURITY.md](docs/SECURITY.md).

## Requirements

- Node.js **LTS** (20+)
- [Expo Go](https://expo.dev/go) **SDK 54** on your phone (must match project — see [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md))
- **Expo SDK 54** in this repo (React Native 0.81, React 19.1)
- Windows PC running LuminaSync Core on the **same Wi‑Fi**
- Camera permission **only** when scanning the PC QR code

## Setup (first time)

```powershell
cd LuminaSync-mobile
npm install
npm run fix-deps
npm run audit:check
```

Dependency security: patched transitive versions via `package.json` `overrides` (see [docs/SECURITY.md](docs/SECURITY.md)). Avoid `npm audit fix --force`.

## Run on device (Expo Go)

```powershell
npm run start:lan
```

1. Scan the **Expo** QR with Expo Go (loads the dev app).
2. On Windows: `poetry run python gui_main.py` → **Pair Mobile**.
3. On the phone: enter the PC **IP** and **6-digit code**, or **Scan QR instead** (PC Pair Mobile QR).
4. Adjust sliders (drag or tap the value for numeric input); pick a saved program; toggle Observer; **Forget pairing** clears secrets.

If the PC unchecks **Keep remote port open**, the app shows that the port closed and reconnects automatically when it is opened again.

Prefer LAN mode (`start:lan`) so the phone reaches your PC on the local network.

## Test without a phone

On the PC, copy pairing JSON from **Pair Mobile**, then:

```powershell
cd ..\LuminaSync-core
# Pair Mobile → Copy JSON → save as scripts\pairing.json (see scripts\pairing.json.example)
poetry run python scripts/ws_remote_client.py --pairing scripts\pairing.json --demo
```

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Connection timeout | Same Wi‑Fi; Windows firewall allows Python on private network; port **8765** |
| Decrypt failed | Re-pair after **New code** on PC |
| Port closed on PC | Enable **Keep remote port open** or open **Pair Mobile** again; app waits and reconnects |
| Expo cannot load bundle | `npm run fix-deps` then `npm run start:lan`; same subnet as PC |
| `expo-asset` missing | Run `npm run fix-deps` after `npm install` |
| QR scan does nothing | Scan **PC Pair Mobile** QR, not Expo terminal QR; or use **Paste JSON** |
| Host rejected | QR must show PC **LAN IPv4** (192.168.x.x), not `127.0.0.1` — reopen Pair Mobile |
| Expo Go asks for URL | That is the dev server QR — use in-app **Scan PC QR code** for pairing |

## Docs

| Document | Content |
|----------|---------|
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, data inventory |
| [docs/INTEGRATION.md](docs/INTEGRATION.md) | Protocol with core |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | LAN WebSocket design |
| [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) | Expo Go vs older phones |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Commits and PRs |

## License

GPL-3.0 — see [LICENSE](LICENSE).
