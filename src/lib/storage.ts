import * as SecureStore from "expo-secure-store";

import type { PairingPayload } from "../types/protocol";
import { PROTOCOL_VERSION } from "../types/protocol";

const KEY_HOST = "luminasync.host";
const KEY_PORT = "luminasync.port";
const KEY_FERNET = "luminasync.key";
const KEY_VERSION = "luminasync.v";

export type StoredPairing = {
  host: string;
  port: number;
  key: string;
  v: number;
};

export async function loadPairing(): Promise<StoredPairing | null> {
  const host = await SecureStore.getItemAsync(KEY_HOST);
  const portStr = await SecureStore.getItemAsync(KEY_PORT);
  const key = await SecureStore.getItemAsync(KEY_FERNET);
  const vStr = await SecureStore.getItemAsync(KEY_VERSION);
  if (!host || !portStr || !key) return null;
  const port = Number(portStr);
  if (!Number.isFinite(port) || port < 1 || port > 65535) return null;
  return {
    host: host.trim(),
    port,
    key: key.trim(),
    v: vStr ? Number(vStr) : PROTOCOL_VERSION,
  };
}

export async function savePairing(payload: PairingPayload): Promise<void> {
  await SecureStore.setItemAsync(KEY_HOST, payload.host.trim());
  await SecureStore.setItemAsync(KEY_PORT, String(payload.port));
  await SecureStore.setItemAsync(KEY_FERNET, payload.key.trim());
  await SecureStore.setItemAsync(KEY_VERSION, String(payload.v));
}

export async function clearPairing(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_HOST);
  await SecureStore.deleteItemAsync(KEY_PORT);
  await SecureStore.deleteItemAsync(KEY_FERNET);
  await SecureStore.deleteItemAsync(KEY_VERSION);
}
