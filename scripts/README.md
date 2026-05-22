# Dev scripts (not used by the Expo app)

Local Fernet / protocol checks against VibranceFlow-core Python crypto.

| Script | Purpose |
|--------|---------|
| `test-fernet-roundtrip.ts` | TS encrypt/decrypt round-trip |
| `test-fernet-cmds-export.ts` | Writes `.test-wires.txt` for `VibranceFlow-core/scripts/test_fernet_cmds.py` |
| `test-fernet-cmds.ts` | Encrypt sample commands |
| `test-fernet-decrypt.ts` | Decrypt a wire from stdin/file |

Artifacts `.test-key.txt` / `.test-wires.txt` are gitignored. Do not commit pairing keys.
