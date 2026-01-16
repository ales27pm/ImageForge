import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface ProgressBarProps {
  progress: number;
  currentStep?: number;
  totalSteps?: number;
}

export function ProgressBar({ progress, currentStep, totalSteps }: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress * 100, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
      {currentStep !== undefined && totalSteps !== undefined ? (
        <ThemedText type="caption" style={styles.stepText}>
          Step {currentStep}/{totalSteps}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  track: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.dark.accent,
    borderRadius: BorderRadius.full,
  },
  stepText: {
    textAlign: "center",
    marginTop: Spacing.sm,
    color: Colors.dark.textSecondary,
  },
});
