import React from "react";
import { StyleSheet, Pressable, View, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import type { GeneratedImage } from "@/lib/storage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface ImageCardProps {
  image: GeneratedImage;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ImageCard({ image, onPress }: ImageCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const truncatePrompt = (prompt: string, maxLength = 40) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + "...";
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <Image
        source={{ uri: image.imageData }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.shimmerOverlay} />
      <LinearGradient
        colors={["transparent", "rgba(10, 10, 15, 0.9)"]}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <ThemedText type="caption" style={styles.date}>
          {formatDate(image.createdAt)}
        </ThemedText>
        <ThemedText type="small" style={styles.prompt} numberOfLines={2}>
          {truncatePrompt(image.prompt)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.dark.backgroundDefault,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${Colors.dark.primary}08`,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
  },
  date: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  prompt: {
    color: Colors.dark.text,
  },
});
