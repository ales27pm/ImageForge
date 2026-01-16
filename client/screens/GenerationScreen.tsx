import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { saveImage, type GeneratedImage } from "@/lib/storage";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Generation">;

type GenerationState = "idle" | "generating" | "complete";

export default function GenerationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [steps, setSteps] = useState(25);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number | null>(null);

  const generatedImageRef = useRef<GeneratedImage | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton
          onPress={() => navigation.goBack()}
          pressColor="transparent"
        >
          <ThemedText style={{ color: Colors.dark.text }}>Cancel</ThemedText>
        </HeaderButton>
      ),
      headerRight: () =>
        state === "idle" ? (
          <HeaderButton
            onPress={handleGenerate}
            disabled={!prompt.trim()}
            pressColor="transparent"
          >
            <ThemedText
              style={{
                color: prompt.trim() ? Colors.dark.primary : Colors.dark.textSecondary,
                fontWeight: "600",
              }}
            >
              Generate
            </ThemedText>
          </HeaderButton>
        ) : null,
    });
  }, [navigation, prompt, state]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState("generating");
    setProgress(0);
    setCurrentStep(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const totalSteps = steps;
    const stepDuration = 200;

    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = Math.min(prev + 1, totalSteps);
        setProgress(next / totalSteps);
        return next;
      });
    }, stepDuration);

    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/generate-image", baseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      clearInterval(progressInterval);
      setProgress(1);
      setCurrentStep(totalSteps);

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      const imageData = `data:${data.mimeType};base64,${data.b64_json}`;
      
      const usedSeed = seed ?? Math.floor(Math.random() * 2147483647);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        imageData,
        seed: usedSeed,
        steps,
        guidanceScale,
        createdAt: new Date().toISOString(),
      };

      generatedImageRef.current = newImage;
      setGeneratedImage(imageData);
      setState("complete");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Generation error:", error);
      setState("idle");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Generation Failed",
        "Unable to generate image. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSaveAndView = async () => {
    if (!generatedImageRef.current) return;

    try {
      await saveImage(generatedImageRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("ImageDetail", { image: generatedImageRef.current });
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Save Failed", "Unable to save image. Please try again.");
    }
  };

  const randomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 2147483647);
    setSeed(newSeed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.promptContainer}>
        <TextInput
          style={styles.promptInput}
          placeholder="Describe your vision..."
          placeholderTextColor={Colors.dark.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          editable={state === "idle"}
          textAlignVertical="top"
        />
      </View>

      {state === "idle" ? (
        <>
          <Pressable
            style={styles.advancedToggle}
            onPress={() => setAdvancedOpen(!advancedOpen)}
          >
            <ThemedText type="headline" style={styles.advancedTitle}>
              Advanced
            </ThemedText>
            <Feather
              name={advancedOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.dark.textSecondary}
            />
          </Pressable>

          {advancedOpen ? (
            <View style={styles.advancedContent}>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <ThemedText type="body">Steps</ThemedText>
                  <ThemedText type="body" style={styles.sliderValue}>
                    {steps}
                  </ThemedText>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={50}
                  step={1}
                  value={steps}
                  onValueChange={setSteps}
                  minimumTrackTintColor={Colors.dark.primary}
                  maximumTrackTintColor={Colors.dark.backgroundSecondary}
                  thumbTintColor={Colors.dark.primary}
                />
              </View>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <ThemedText type="body">Guidance Scale</ThemedText>
                  <ThemedText type="body" style={styles.sliderValue}>
                    {guidanceScale.toFixed(1)}
                  </ThemedText>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  step={0.5}
                  value={guidanceScale}
                  onValueChange={setGuidanceScale}
                  minimumTrackTintColor={Colors.dark.primary}
                  maximumTrackTintColor={Colors.dark.backgroundSecondary}
                  thumbTintColor={Colors.dark.primary}
                />
              </View>

              <View style={styles.seedContainer}>
                <View style={styles.seedInputWrapper}>
                  <ThemedText type="body">Seed</ThemedText>
                  <TextInput
                    style={styles.seedInput}
                    placeholder="Random"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={seed !== null ? seed.toString() : ""}
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      setSeed(isNaN(num) ? null : num);
                    }}
                    keyboardType="number-pad"
                  />
                </View>
                <Pressable style={styles.randomButton} onPress={randomizeSeed}>
                  <Feather name="shuffle" size={20} color={Colors.dark.text} />
                </Pressable>
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {state === "generating" ? (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            currentStep={currentStep}
            totalSteps={steps}
          />
          <ThemedText type="body" style={styles.generatingText}>
            Forging your image...
          </ThemedText>
        </View>
      ) : null}

      {state === "complete" && generatedImage ? (
        <View style={styles.resultContainer}>
          <Image
            source={{ uri: generatedImage }}
            style={styles.generatedImage}
            contentFit="cover"
            transition={300}
          />
          <Button onPress={handleSaveAndView} style={styles.saveButton}>
            Save & View
          </Button>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  promptContainer: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  promptInput: {
    height: 120,
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
  },
  advancedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  advancedTitle: {
    color: Colors.dark.text,
  },
  advancedContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  sliderContainer: {
    marginBottom: Spacing.xl,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sliderValue: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  seedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  seedInputWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seedInput: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.dark.text,
    width: 120,
    textAlign: "right",
  },
  randomButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  progressContainer: {
    marginTop: Spacing["2xl"],
  },
  generatingText: {
    textAlign: "center",
    marginTop: Spacing.lg,
    color: Colors.dark.textSecondary,
  },
  resultContainer: {
    marginTop: Spacing.xl,
  },
  generatedImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  saveButton: {
    width: "100%",
  },
});
