import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { SliderRow } from "../components/SliderRow";
import { LuminaWsClient, type DisconnectReason } from "../lib/wsClient";
import { clearPairing, type StoredPairing } from "../lib/storage";
import { redactHostPort } from "../lib/redact";
import type { ProgramEntry, SliderState } from "../types/protocol";
import { DEFAULT_SLIDERS } from "../types/protocol";
import { colors } from "../theme";

const DEBOUNCE_MS = 180;
const STATE_POLL_MS = 1500;
const RECONNECT_MS = 2500;

type Props = {
  pairing: StoredPairing;
  onForget: () => void;
  onRepair: () => void;
};

function applyState(
  st: NonNullable<import("../types/protocol").RemoteResponse["state"]>,
  setObserver: (v: boolean) => void,
  setActiveExe: (v: string) => void,
  setSliders: (v: SliderState) => void,
  setPrograms: (v: ProgramEntry[]) => void,
  setEditingExe: (v: string | null) => void,
  editingExe: string | null,
) {
  setObserver(!!st.observer_enabled);
  setActiveExe(st.active_exe ?? "—");
  const list = st.programs ?? [];
  setPrograms(list);

  const pick =
    editingExe && list.some((p) => p.exe === editingExe)
      ? editingExe
      : st.active_exe && list.some((p) => p.exe === st.active_exe)
        ? st.active_exe
        : list[0]?.exe ?? st.active_exe;

  if (pick) {
    setEditingExe(pick);
    const entry = list.find((p) => p.exe === pick);
    if (entry?.sliders) {
      setSliders({ ...DEFAULT_SLIDERS, ...entry.sliders });
      return;
    }
  }
  if (st.sliders) setSliders({ ...DEFAULT_SLIDERS, ...st.sliders });
}

export function ControlScreen({ pairing, onForget: onForgetCallback, onRepair }: Props) {
  const clientRef = useRef(new LuminaWsClient());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectGenRef = useRef(0);
  const editingExeRef = useRef<string | null>(null);
  const activeExeRef = useRef("—");

  const [status, setStatus] = useState<"connecting" | "connected" | "waiting" | "error">(
    "connecting",
  );
  const [statusMsg, setStatusMsg] = useState("");
  const [observer, setObserver] = useState(true);
  const [activeExe, setActiveExe] = useState("—");
  const [editingExe, setEditingExe] = useState<string | null>(null);
  const [programs, setPrograms] = useState<ProgramEntry[]>([]);
  const [sliders, setSliders] = useState<SliderState>(DEFAULT_SLIDERS);

  useEffect(() => {
    editingExeRef.current = editingExe;
  }, [editingExe]);

  useEffect(() => {
    activeExeRef.current = activeExe;
  }, [activeExe]);

  const refreshState = useCallback(async () => {
    const client = clientRef.current;
    if (!client.connected) return;
    const resp = await client.sendCommand("get_state");
    if (!resp.ok) throw new Error(resp.error ?? "get_state failed");
    if (resp.state) {
      applyState(
        resp.state,
        setObserver,
        setActiveExe,
        setSliders,
        setPrograms,
        setEditingExe,
        editingExeRef.current,
      );
    }
  }, []);

  const connectToPc = useCallback(
    async (gen: number) => {
      const client = clientRef.current;
      setStatus("connecting");
      setStatusMsg(redactHostPort(pairing.host, pairing.port));
      await client.connect(pairing.host, pairing.port, pairing.key);
      if (gen !== connectGenRef.current) return;
      const ping = await client.sendCommand("ping");
      if (!ping.ok) throw new Error(ping.error ?? "ping failed");
      await refreshState();
      if (gen !== connectGenRef.current) return;
      setStatus("connected");
      setStatusMsg(`Connected · ${redactHostPort(pairing.host, pairing.port)}`);
    },
    [pairing.host, pairing.port, pairing.key, refreshState],
  );

  const onDisconnect = useCallback((reason: DisconnectReason) => {
    if (reason === "port_closed") {
      setStatus("waiting");
      setStatusMsg("PC closed remote port (8765). Waiting for it to reopen…");
      return;
    }
    setStatus("error");
    setStatusMsg(
      "Lost connection. If you clicked New code on Windows, re-pair with a fresh QR or 6-digit code.",
    );
  }, []);

  useEffect(() => {
    const gen = ++connectGenRef.current;
    const client = clientRef.current;
    client.onDisconnect = onDisconnect;

    let cancelled = false;
    connectToPc(gen).catch((e) => {
      if (!cancelled && gen === connectGenRef.current) {
        setStatus("error");
        setStatusMsg(e instanceof Error ? e.message : "Connection failed");
      }
    });

    return () => {
      cancelled = true;
      client.onDisconnect = null;
      client.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [connectToPc, onDisconnect]);

  useEffect(() => {
    if (status !== "waiting") return;
    const id = setInterval(() => {
      const gen = connectGenRef.current;
      connectToPc(gen).catch(() => {
        /* keep waiting */
      });
    }, RECONNECT_MS);
    return () => clearInterval(id);
  }, [status, connectToPc]);

  useEffect(() => {
    if (status !== "connected") return;
    const id = setInterval(() => {
      refreshState()
        .then(() => setStatusMsg(`Connected · ${redactHostPort(pairing.host, pairing.port)}`))
        .catch(() => {
          /* onDisconnect will handle socket loss */
        });
    }, STATE_POLL_MS);
    return () => clearInterval(id);
  }, [status, pairing.host, pairing.port, refreshState]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && status === "connected") {
        refreshState().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [status, refreshState]);

  const pushSliders = useCallback(
    (next: SliderState) => {
      const client = clientRef.current;
      if (!client.connected) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const exe = editingExeRef.current ?? activeExeRef.current;
        const payload: Record<string, unknown> = { ...next };
        if (exe && exe !== "—") payload.exe = exe;
        client
          .sendCommand("set_sliders", payload)
          .then((resp) => {
            if (!resp.ok) throw new Error(resp.error ?? "set_sliders failed");
            if (resp.state) {
              applyState(
                resp.state,
                setObserver,
                setActiveExe,
                setSliders,
                setPrograms,
                setEditingExe,
                editingExeRef.current,
              );
            }
            setStatusMsg(`Connected · ${redactHostPort(pairing.host, pairing.port)}`);
          })
          .catch((e) => setStatusMsg(e instanceof Error ? e.message : "Send failed"));
      }, DEBOUNCE_MS);
    },
    [pairing.host, pairing.port],
  );

  const onSliderChange = (key: keyof SliderState, value: number) => {
    setSliders((prev) => {
      const next = { ...prev, [key]: value };
      pushSliders(next);
      return next;
    });
  };

  const onSelectProgram = (exe: string) => {
    const entry = programs.find((p) => p.exe === exe);
    setEditingExe(exe);
    editingExeRef.current = exe;
    if (entry?.sliders) setSliders({ ...DEFAULT_SLIDERS, ...entry.sliders });
  };

  const onObserver = async (enabled: boolean) => {
    setObserver(enabled);
    try {
      const resp = await clientRef.current.sendCommand("set_observer", { enabled: !!enabled });
      if (!resp.ok) throw new Error(resp.error ?? "set_observer failed");
      if (resp.state) {
        applyState(
          resp.state,
          setObserver,
          setActiveExe,
          setSliders,
          setPrograms,
          setEditingExe,
          editingExeRef.current,
        );
      }
      setStatusMsg(`Connected · ${redactHostPort(pairing.host, pairing.port)}`);
    } catch (e) {
      setObserver(!enabled);
      setStatusMsg(e instanceof Error ? e.message : "Failed");
    }
  };

  const onReset = async () => {
    try {
      const exe = editingExeRef.current ?? activeExeRef.current;
      const payload: Record<string, unknown> = {};
      if (exe && exe !== "—") payload.exe = exe;
      const resp = await clientRef.current.sendCommand("reset_profile", payload);
      if (!resp.ok) throw new Error(resp.error ?? "reset failed");
      await refreshState();
      setStatusMsg("Profile reset to GPU defaults.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Reset failed");
    }
  };

  const handleForget = async () => {
    clientRef.current.disconnect();
    await clearPairing();
    onForgetCallback();
  };

  if (status === "connecting" || status === "waiting") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>
          {status === "waiting" ? "Waiting for PC…" : "Connecting…"}
        </Text>
        <Text style={styles.mutedSmall}>{statusMsg}</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{statusMsg}</Text>
        <Pressable style={styles.primaryBtn} onPress={onRepair}>
          <Text style={styles.primaryText}>Re-pair</Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={handleForget}>
          <Text style={styles.linkText}>Forget pairing</Text>
        </Pressable>
      </View>
    );
  }

  const editingLabel = editingExe ?? activeExe;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Control</Text>
      <Text style={styles.mutedSmall}>{statusMsg}</Text>
      <Text style={styles.exe}>Running: {activeExe}</Text>
      <Text style={styles.exeSub}>Editing: {editingLabel}</Text>

      {programs.length > 0 ? (
        <View style={styles.programsBlock}>
          <Text style={styles.programsTitle}>Programs on PC</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {programs.map((p) => {
              const sel = p.exe === editingExe;
              const short = p.exe.replace(/\.exe$/i, "").slice(0, 12);
              return (
                <Pressable
                  key={p.exe}
                  style={[styles.progChip, sel && styles.progChipSel]}
                  onPress={() => onSelectProgram(p.exe)}
                >
                  <Text style={[styles.progChipText, sel && styles.progChipTextSel]}>{short}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.mutedSmall}>No saved programs on PC yet — add one in LuminaSync.</Text>
      )}

      <View style={styles.rowSwitch}>
        <Text style={styles.label}>Observer</Text>
        <Switch
          value={observer}
          onValueChange={onObserver}
          trackColor={{ true: colors.accent, false: "#30363d" }}
        />
      </View>

      <SliderRow
        label="Vibrance"
        value={sliders.vibrance}
        min={0}
        max={100}
        step={1}
        onChange={(v) => onSliderChange("vibrance", v)}
      />
      <SliderRow
        label="Brightness"
        value={sliders.brightness}
        min={-100}
        max={100}
        step={1}
        onChange={(v) => onSliderChange("brightness", v)}
      />
      <SliderRow
        label="Contrast"
        value={sliders.contrast}
        min={-100}
        max={100}
        step={1}
        onChange={(v) => onSliderChange("contrast", v)}
      />
      <SliderRow
        label="Gamma"
        value={sliders.gamma}
        min={0.4}
        max={2.8}
        step={0.05}
        format={(v) => v.toFixed(2)}
        onChange={(v) => onSliderChange("gamma", v)}
      />
      <SliderRow
        label="Hue"
        value={sliders.hue}
        min={0}
        max={359}
        step={1}
        onChange={(v) => onSliderChange("hue", v)}
      />

      <Pressable style={styles.secondaryBtn} onPress={onReset}>
        <Text style={styles.secondaryText}>Reset profile (GPU default)</Text>
      </Pressable>

      <Pressable style={styles.linkBtn} onPress={onRepair}>
        <Text style={styles.linkText}>Re-pair</Text>
      </Pressable>
      <Pressable style={styles.linkBtn} onPress={handleForget}>
        <Text style={[styles.linkText, { color: colors.danger }]}>Forget pairing</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { color: colors.accent, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  exe: { color: colors.text, fontSize: 14, marginTop: 8 },
  exeSub: { color: colors.muted, fontSize: 13, marginBottom: 8 },
  muted: { color: colors.muted, marginTop: 12 },
  mutedSmall: { color: colors.muted, fontSize: 12, marginBottom: 8 },
  error: { color: colors.danger, textAlign: "center", marginBottom: 20, fontSize: 14 },
  programsBlock: { marginBottom: 12 },
  programsTitle: { color: colors.text, fontSize: 13, marginBottom: 8 },
  progChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.card,
  },
  progChipSel: { borderColor: colors.accent, backgroundColor: "#1a3a2f" },
  progChipText: { color: colors.muted, fontSize: 13 },
  progChipTextSel: { color: colors.accent, fontWeight: "600" },
  rowSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: colors.text, fontSize: 16 },
  primaryBtn: {
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    minWidth: 200,
    alignItems: "center",
  },
  primaryText: { color: colors.bg, fontWeight: "700" },
  secondaryBtn: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
  },
  secondaryText: { color: colors.accent, fontWeight: "600" },
  linkBtn: { marginTop: 16, alignItems: "center" },
  linkText: { color: colors.accent, fontSize: 14 },
});
