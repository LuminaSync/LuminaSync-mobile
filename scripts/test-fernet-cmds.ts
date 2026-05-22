import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";

(globalThis as typeof globalThis & { crypto?: Crypto }).crypto ??= webcrypto as Crypto;
import { encryptJson } from "../src/lib/fernetWire";

const key = readFileSync(".test-key.txt", "utf8").trim();
const cmds: Record<string, string> = {
  ping: '{"v":1,"id":"abcd1234","cmd":"ping"}',
  get_state: '{"v":1,"id":"abcd1234","cmd":"get_state"}',
  set_observer: '{"v":1,"id":"abcd1234","cmd":"set_observer","payload":{"enabled":false}}',
  set_sliders:
    '{"v":1,"id":"abcd1234","cmd":"set_sliders","payload":{"vibrance":50,"brightness":0,"contrast":0,"gamma":1,"hue":0}}',
};

for (const [name, plain] of Object.entries(cmds)) {
  const wire = encryptJson(key, plain);
  console.log(name, wire.length);
}
