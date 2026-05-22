import { useCallback, useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import { PairScreen } from "./src/screens/PairScreen";
import { ControlScreen } from "./src/screens/ControlScreen";
import { loadPairing, type StoredPairing } from "./src/lib/storage";
import type { PairingPayload } from "./src/types/protocol";
import { colors } from "./src/theme";

type Screen = "loading" | "pair" | "control";

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [pairing, setPairing] = useState<StoredPairing | null>(null);

  useEffect(() => {
    loadPairing()
      .then((p) => {
        if (p) {
          setPairing(p);
          setScreen("control");
        } else {
          setScreen("pair");
        }
      })
      .catch(() => setScreen("pair"));
  }, []);

  const onPaired = useCallback((payload: PairingPayload) => {
    setPairing({
      host: payload.host,
      port: payload.port,
      key: payload.key,
      v: payload.v,
    });
    setScreen("control");
  }, []);

  const onForget = useCallback(() => {
    setPairing(null);
    setScreen("pair");
  }, []);

  const onRepair = useCallback(() => {
    setScreen("pair");
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" />
        <ExpoStatusBar style="light" />
        {screen === "loading" ? null : screen === "pair" ? (
          <PairScreen onPaired={onPaired} />
        ) : pairing ? (
          <ControlScreen pairing={pairing} onForget={onForget} onRepair={onRepair} />
        ) : (
          <PairScreen onPaired={onPaired} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
