# Integration with LuminaSync Core

This document is the contract between **LuminaSync-mobile** and **LuminaSync-core**. Keep both sides in sync when the protocol changes.

## Profile units (must match core)

Same as `ColorProfile` in core `core/models.py` and `profiles.json`:

| Field | Type | Range / notes |
|-------|------|----------------|
| `vibrance` | number | 0–100 (percent) |
| `brightness` | number | offset % (e.g. `42` = +42%) |
| `contrast` | number | offset % |
| `gamma` | number | 0.4–2.8 |
| `hue` | number | 0–359, optional |

## Example plaintext payload (before encryption)

```json
{
  "v": 1,
  "id": "a1b2c3d4",
  "cmd": "set_sliders",
  "payload": {
    "vibrance": 80,
    "brightness": 10,
    "contrast": 5,
    "gamma": 1.05,
    "hue": 0
  }
}
```

Server responds (plaintext before encryption):

```json
{
  "v": 1,
  "id": "a1b2c3d4",
  "ok": true,
  "state": {
    "observer_enabled": true,
    "active_exe": "game.exe",
    "sliders": {
      "vibrance": 80,
      "brightness": 10,
      "contrast": 5,
      "gamma": 1.05,
      "hue": 0
    }
  }
}
```

## Commands (v1)

| Command | Payload | Notes |
|---------|---------|--------|
| `ping` | — | Health check |
| `get_state` | — | Observer flag, active exe, current sliders |
| `set_sliders` | vibrance, brightness, contrast, gamma, hue; optional `exe` | Applies immediately; saves profile when exe is known |
| `set_observer` | `enabled` (bool) | Toggles engine |
| `reset_profile` | optional `exe` | Resets profile to GPU defaults at PC startup; uses active exe if omitted |

## Wire format

UTF-8 JSON envelope, encrypted with Fernet (key from QR), sent as a **base64url** WebSocket text frame.

## Settings keys (global)

From `AppSettings` / `profiles.json` `settings` section:

- `observer_enabled` (bool)
- `desktop_vibrance`, `desktop_brightness`, `desktop_contrast`, `desktop_gamma`, `desktop_hue`

Mobile may expose observer toggle and "desktop colors" separately from per-game profiles.

## Versioning

- Bump `"v"` in QR JSON and message envelope together.
- Mobile must refuse unknown major versions with a clear upgrade message.

## Repository boundaries

| Concern | Owner repo |
|---------|------------|
| NVAPI / GDI | LuminaSync-core |
| WebSocket server + QR | LuminaSync-core |
| UI sliders + QR scan | LuminaSync-mobile |
| Public downloads / SEO | LuminaSync-web |

## References

- Core example config: `profiles.json.example` on [LuminaSync-core](https://github.com/LuminaSync/LuminaSync-core)
- PoC validation (archived): [LuminaSync-PoC](https://github.com/LuminaSync/LuminaSync-PoC)
