# Mobile architecture

## Problem

Display tuning tools often require Alt+Tab during competitive play. LuminaSync Mobile is a **local remote control**: adjust vibrance, brightness, contrast, gamma, and hue from the phone while the game stays fullscreen on Windows.

## Why LAN WebSockets (not Bluetooth)

| Approach | Verdict |
|----------|---------|
| Bluetooth on Windows (Python server) | Fragile pairing, poor desktop server story, higher latency for frequent slider events |
| HTTP polling | Too slow for real-time sliders |
| **WebSocket over Wi‑Fi/LAN** | Persistent channel, low latency, straightforward Python server in core |

Bluetooth may be explored later for discovery only; **v1 uses LAN**.

## Security model (local zero-trust)

Public CA TLS on raw LAN IPs is awkward (certificate warnings). v1 uses **payload encryption** instead:

1. Core generates a strong random key (Fernet / AES-256) per session or per pairing.
2. Desktop UI shows a **QR code** with non-secret routing + secret:

   ```json
   {
     "v": 1,
     "host": "192.168.1.42",
     "port": 8765,
     "key": "<base64-url-safe-fernet-key>"
   }
   ```

3. Phone scans QR, stores `key` in secure storage, opens `ws://host:port`.
4. Every command is a JSON object, serialized, **encrypted**, sent as a text or binary frame.
5. Core rejects frames that fail decrypt or authentication (wrong key, replay without session id if added later).

Threat model: neighbors on the same Wi‑Fi cannot forge or read commands without the pairing secret. This is **not** a substitute for internet-facing TLS if a future cloud relay is added.

### Hardening checklist (implementation time)

- [ ] Bind WebSocket to LAN interface only (not `0.0.0.0` on public networks without firewall rules).
- [ ] Optional: require user confirmation on PC when a new device pairs.
- [ ] Session rotation: new QR invalidates old phone keys.
- [ ] Rate limits and maximum message size on server.

## Message flow

```
┌─────────────┐   QR (once)    ┌─────────────┐
│ LuminaSync  │ ◄───────────── │ Mobile app  │
│ Core (PC)   │                │ Android/iOS │
└──────┬──────┘                └──────┬──────┘
       │  ws://host:port              │
       │  encrypted {"cmd":...}       │
       ◄──────────────────────────────┤
       │  encrypted {"ok":true,...}   │
       └──────────────────────────────►
```

## Planned commands (v1)

| Command | Purpose |
|---------|---------|
| `get_state` | Current profile + observer flag |
| `set_sliders` | Partial update: vibrance, brightness, contrast, gamma, hue |
| `set_observer` | Enable/disable foreground observer |
| `apply_desktop` | Apply desktop baseline profile |
| `ping` | Keepalive |

Exact JSON schema lives in `docs/INTEGRATION.md` (versioned field `v`).

## Desktop side (implemented in LuminaSync-core, not this repo)

- Thread/async WebSocket server (e.g. `websockets` library).
- `qrcode` for on-screen pairing.
- `cryptography.fernet` for encrypt/decrypt.
- Reuse `WindowsDisplayManager` / `ProfileManager` — no duplicate NVAPI logic on phone.

## Mobile side (this repo)

- **Expo / React Native** recommended for one TypeScript codebase.
- Screens: Home (connection), Pair (QR), Control (sliders), Settings (forget pairing).
- Reconnect with backoff when PC IP changes (show "repair" if QR needed).

## Alternatives considered

| Stack | Notes |
|-------|-------|
| Flutter + Dart | Excellent UI; team picks one cross-platform stack and sticks to it |
| Native Kotlin + Swift | Best platform integration; double maintenance |

Default recommendation in README: Expo unless the repository already standardizes on Flutter.
