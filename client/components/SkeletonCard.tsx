import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

export function SkeletonCard() {
  const shimmerPosition = useSharedValue(-CARD_WIDTH);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(CARD_WIDTH * 2, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            `${Colors.dark.primary}15`,
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    overflow: "hidden",
  },
  shimmer: {
    width: CARD_WIDTH,
    height: "100%",
    position: "absolute",
  },
});
