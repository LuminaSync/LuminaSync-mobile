# VibranceFlow Mobile

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Build Android APK](https://github.com/VibranceFlow/VibranceFlow-mobile/actions/workflows/build-android.yml/badge.svg)](https://github.com/VibranceFlow/VibranceFlow-mobile/actions/workflows/build-android.yml)

VibranceFlow Mobile is the Android companion app for controlling VibranceFlow Core on your Windows PC over local Wi-Fi.

## Release 1.0 scope

- Supported mobile release platform: **Android**
- Public build format: **APK (`vibranceflow-release.apk`)**
- iOS support remains in development flow only (not part of public 1.0 release)

## Install on Android

1. Open the repository **Releases** page.
2. Download the latest APK artifact.
3. Install it on your Android device (allow unknown sources when Android requests it).
4. Open the app and keep your phone on the same Wi-Fi as the Windows PC.

## Pairing with your PC

1. On Windows, open VibranceFlow Core and click **Pair Mobile**.
2. On Android, open VibranceFlow Mobile.
3. Pair using one of these methods:
   - scan the QR code from the PC (recommended)
   - enter the PC IP address and 6-digit pairing code

After pairing, all controls are available from the phone:

- color sliders (including Hue)
- app selection
- observer toggle
- per-app audio volume and mute (when live audio is available on PC)

## Privacy and data policy

- No cloud account required.
- No analytics or telemetry backend required.
- Pairing secrets stay on-device in secure storage.
- Communication is LAN-only and encrypted at the payload layer.

Security details: [docs/SECURITY.md](docs/SECURITY.md)

## Troubleshooting

- **Cannot connect:** confirm both devices are on the same LAN and Core is allowed in Windows Firewall (private network).
- **Pairing fails after PC code refresh:** re-pair from the app.
- **Audio slider unavailable:** selected app has no active audio session on the PC.

## For developers

Development setup, Expo workflow, and contribution rules are documented in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

GPL-3.0 — see [LICENSE](LICENSE).
