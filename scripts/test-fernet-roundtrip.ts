import { webcrypto } from "node:crypto";
(globalThis as typeof globalThis & { crypto?: Crypto }).crypto ??=
  webcrypto as Crypto;
import { encryptJson } from "../src/lib/fernetWire";

const key = process.argv[2];
const plain = process.argv[3] ?? '{"v":1,"id":"abcd1234","cmd":"ping"}';
if (!key) {
  console.error("usage: npx tsx scripts/test-fernet-roundtrip.ts <fernet-key>");
  process.exit(1);
}
process.stdout.write(encryptJson(key, plain));
