import { webcrypto } from "node:crypto";
import { writeFileSync, readFileSync } from "node:fs";

(globalThis as typeof globalThis & { crypto?: Crypto }).crypto ??=
  webcrypto as Crypto;
import { encryptJson } from "../src/lib/fernetWire";

const key = readFileSync(".test-key.txt", "utf8").trim();
const cmds = [
  '{"v":1,"id":"abcd1234","cmd":"ping"}',
  '{"v":1,"id":"abcd1234","cmd":"get_state"}',
  '{"v":1,"id":"abcd1234","cmd":"set_observer","payload":{"enabled":false}}',
  '{"v":1,"id":"abcd1234","cmd":"set_sliders","payload":{"vibrance":50,"brightness":0,"contrast":0,"gamma":1,"hue":0}}',
];
const wires = cmds.map((c) => encryptJson(key, c));
writeFileSync(".test-wires.txt", wires.join("\n"), "utf8");
