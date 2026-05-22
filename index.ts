import "react-native-get-random-values";
import { Buffer } from "buffer";

// Fernet + WebSocket crypto on React Native
if (!(global as typeof globalThis & { Buffer?: typeof Buffer }).Buffer) {
  (global as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
}

import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);
