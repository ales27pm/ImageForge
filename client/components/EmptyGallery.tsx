import React from "react";
import { StyleSheet, View, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

export function EmptyGallery() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/empty-gallery.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <ThemedText type="h3" style={styles.title}>
        Forge Your First Image
      </ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        Tap the button below to start creating AI-generated masterpieces
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: Spacing["2xl"],
    opacity: 0.9,
  },
  title: {
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
