import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";

import { colors } from "../theme";

type Props = {
  value: number;
  muted: boolean;
  available: boolean;
  statusText?: string;
  onChange: (value: number) => void;
  onToggleMute: () => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
};

export function VerticalAudioSlider({
  value,
  muted,
  available,
  statusText,
  onChange,
  onToggleMute,
  onSlidingStart,
  onSlidingComplete,
}: Props) {
  const icon = muted ? "🔇" : "🔊";
  const tint = available ? colors.accent : colors.muted;
  const trackRef = useRef<View>(null);
  const trackBoundsRef = useRef({ y: 0, height: 1 });
  const [trackHeight, setTrackHeight] = useState(1);
  const clamped = Math.max(0, Math.min(100, value));
  const thumbTop = ((100 - clamped) / 100) * Math.max(trackHeight - 24, 1);

  const measureTrack = useCallback(() => {
    trackRef.current?.measureInWindow((_x, y, _width, height) => {
      const nextHeight = Math.max(height, 1);
      trackBoundsRef.current = { y, height: nextHeight };
      setTrackHeight(nextHeight);
    });
  }, []);

  const updateFromPageY = useCallback(
    (pageY: number) => {
      const { y, height } = trackBoundsRef.current;
      const ratio = 1 - (pageY - y) / Math.max(height, 1);
      const next = Math.round(Math.max(0, Math.min(100, ratio * 100)));
      onChange(next);
    },
    [onChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => available,
        onMoveShouldSetPanResponder: () => available,
        onPanResponderGrant: (event, gestureState) => {
          onSlidingStart?.();
          measureTrack();
          updateFromPageY(gestureState.y0 || event.nativeEvent.pageY || 0);
        },
        onPanResponderMove: (event, gestureState) => {
          updateFromPageY(gestureState.moveY || event.nativeEvent.pageY || 0);
        },
        onPanResponderRelease: () => {
          onSlidingComplete?.();
        },
        onPanResponderTerminate: () => {
          onSlidingComplete?.();
        },
      }),
    [
      available,
      measureTrack,
      onSlidingComplete,
      onSlidingStart,
      updateFromPageY,
    ],
  );

  return (
    <View style={[styles.card, !available && styles.cardDisabled]}>
      <Text style={[styles.label, !available && styles.labelDisabled]}>
        Audio
      </Text>
      <Pressable
        style={[styles.iconButton, !available && styles.iconButtonDisabled]}
        onPress={onToggleMute}
        disabled={!available}
      >
        <Text style={[styles.iconText, { color: tint }]}>{icon}</Text>
      </Pressable>
      <View style={styles.sliderTouch}>
        <View
          ref={trackRef}
          style={[styles.sliderFrame, !available && styles.sliderFrameDisabled]}
          onLayout={measureTrack}
          {...panResponder.panHandlers}
        >
          <View pointerEvents="none" style={styles.trackRail} />
          <View
            pointerEvents="none"
            style={[
              styles.trackFill,
              {
                backgroundColor: available ? colors.accent : colors.muted,
                height: `${clamped}%`,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              !available && styles.thumbDisabled,
              { top: thumbTop },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.hint, !available && styles.hintDisabled]}>
        {statusText ?? (available ? "Live" : "No session")}
      </Text>
      <Text style={[styles.value, !available && styles.valueDisabled]}>
        {Math.round(value)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 86,
    minHeight: 248,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardDisabled: {
    backgroundColor: "#12161d",
    borderColor: "#242b35",
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  labelDisabled: {
    color: colors.muted,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "#132821",
  },
  iconButtonDisabled: {
    backgroundColor: "#1a2028",
  },
  iconText: {
    fontSize: 20,
  },
  sliderFrame: {
    width: 42,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    position: "relative",
  },
  sliderFrameDisabled: {
    opacity: 0.82,
  },
  sliderTouch: {
    width: 64,
    height: 184,
    justifyContent: "center",
    alignItems: "center",
  },
  trackRail: {
    position: "absolute",
    width: 8,
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#30363d",
  },
  trackFill: {
    position: "absolute",
    bottom: 0,
    width: 8,
    borderRadius: 999,
  },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.bg,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  thumbDisabled: {
    backgroundColor: colors.muted,
  },
  value: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  valueDisabled: {
    color: colors.muted,
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  hintDisabled: {
    color: "#6b7280",
  },
});
