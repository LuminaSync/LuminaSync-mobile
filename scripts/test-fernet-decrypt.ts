import { readFileSync } from "node:fs";
import { decryptJson } from "../src/lib/fernetWire";

const key = readFileSync(".test-key.txt", "utf8").trim();
const wire = readFileSync(".test-wire2.txt", "utf8").trim();
console.log(decryptJson(key, wire));
