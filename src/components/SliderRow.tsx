import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";

import { colors } from "../theme";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
};

function snapToStep(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  const clamped = Math.min(max, Math.max(min, value));
  if (step <= 0) return clamped;
  const snapped = Math.round(clamped / step) * step;
  const decimals = step < 1 ? (String(step).split(".")[1]?.length ?? 2) : 0;
  return Number(snapped.toFixed(decimals));
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
  onSlidingStart,
  onSlidingComplete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const trackRef = useRef<View>(null);
  const [trackFrame, setTrackFrame] = useState({ x: 0, width: 1 });

  const display = format
    ? format(value)
    : String(Math.round(value * 100) / 100);
  const decimals = step < 1 ? 2 : 0;

  useEffect(() => {
    if (!editing) setDraft(display);
  }, [display, editing]);

  const commitDraft = useCallback(() => {
    const parsed = Number(draft.replace(",", "."));
    if (!Number.isFinite(parsed)) {
      setDraft(display);
      setEditing(false);
      return;
    }
    onChange(snapToStep(parsed, min, max, step));
    setEditing(false);
  }, [draft, display, min, max, onChange, step]);

  const onSlide = (v: number) => {
    onChange(snapToStep(v, min, max, step));
  };

  const measureTrack = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      setTrackFrame({ x, width: Math.max(width, 1) });
    });
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          Math.abs(gestureState.dx) > 6 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onMoveShouldSetPanResponderCapture: (_event, gestureState) =>
          Math.abs(gestureState.dx) > 6 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onPanResponderGrant: (event, gestureState) => {
          onSlidingStart?.();
          const pageX =
            gestureState.moveX ||
            event.nativeEvent.pageX ||
            event.nativeEvent.locationX ||
            0;
          onSlide(
            min + ((pageX - trackFrame.x) / trackFrame.width) * (max - min),
          );
        },
        onPanResponderMove: (event, gestureState) => {
          const pageX =
            gestureState.moveX ||
            event.nativeEvent.pageX ||
            event.nativeEvent.locationX ||
            0;
          onSlide(
            min + ((pageX - trackFrame.x) / trackFrame.width) * (max - min),
          );
        },
        onPanResponderRelease: () => {
          onSlidingComplete?.();
        },
        onPanResponderTerminate: () => {
          onSlidingComplete?.();
        },
      }),
    [max, min, onSlidingComplete, onSlidingStart, trackFrame],
  );

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {editing ? (
          <TextInput
            style={styles.valueInput}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitDraft}
            onSubmitEditing={commitDraft}
            keyboardType={decimals > 0 ? "decimal-pad" : "number-pad"}
            returnKeyType="done"
            selectTextOnFocus
            autoFocus
          />
        ) : (
          <Pressable
            onPress={() => {
              setDraft(display);
              setEditing(true);
            }}
            hitSlop={8}
          >
            <Text style={styles.value}>{display}</Text>
          </Pressable>
        )}
      </View>
      <View
        ref={trackRef}
        style={styles.sliderTouch}
        onLayout={measureTrack}
        {...panResponder.panHandlers}
      >
        <View pointerEvents="none">
          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={value}
            onValueChange={onSlide}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor="#30363d"
            thumbTintColor={colors.accent}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#30363d",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  label: { color: colors.text, fontSize: 13, flex: 1 },
  value: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
    minWidth: 52,
    textAlign: "right",
  },
  valueInput: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    minWidth: 72,
    textAlign: "right",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  sliderTouch: {
    width: "100%",
    justifyContent: "center",
    minHeight: 44,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  slider: { width: "100%", height: 38 },
});
