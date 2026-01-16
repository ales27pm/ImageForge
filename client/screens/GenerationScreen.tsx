import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";

import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { saveBase64Image } from "@/lib/image-storage";
import { saveImage, type GeneratedImage } from "@/lib/storage";
import {
  getCoreMLGenerator,
  getCoreMLGeneratorEventEmitter,
  isCoreMLGeneratorAvailable,
  type CoreMLGenerationProgressEvent,
} from "@/native/CoreMLGeneratorNative";

type Props = NativeStackScreenProps<RootStackParamList, "Generation">;

type ScreenState = "idle" | "generating" | "complete";

type GenerationResult = {
  fileUri: string;
  seed: number;
  stepCount: number;
  guidanceScale: number;
};

function createProgressController({
  totalSteps,
  stepDurationMs,
  setCurrentStep,
  setProgress,
}: {
  totalSteps: number;
  stepDurationMs: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}) {
  let interval: ReturnType<typeof setInterval> | null = null;

  const startInterval = () => {
    interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = Math.min(prev + 1, totalSteps);
        setProgress(totalSteps > 0 ? next / totalSteps : 0);
        return next;
      });
    }, stepDurationMs);
  };

  const bindEmitter = (
    emitter: ReturnType<typeof getCoreMLGeneratorEventEmitter> | null,
    eventName: string,
  ) => {
    if (!emitter) return null;
    return emitter.addListener(
      eventName,
      (event: CoreMLGenerationProgressEvent) => {
        const total = event?.totalSteps ?? totalSteps;
        const step = event?.step ?? 0;
        setCurrentStep(step);
        if (total > 0) setProgress(Math.min(step / total, 1));
      },
    );
  };

  const complete = (stepCount: number) => {
    setProgress(1);
    setCurrentStep(stepCount);
  };

  const cleanup = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  return { startInterval, bindEmitter, complete, cleanup };
}

async function generateWithCoreML({
  prompt,
  steps,
  seed,
  guidanceScale,
}: {
  prompt: string;
  steps: number;
  seed?: number;
  guidanceScale: number;
}): Promise<GenerationResult> {
  const coreML = getCoreMLGenerator();
  if (!coreML) throw new Error("CoreML generator not available");

  const result = await coreML.generate(prompt, {
    stepCount: steps,
    seed,
    guidanceScale,
    width: 512,
    height: 512,
  });

  return {
    fileUri: result.fileUri,
    seed: result.seed,
    stepCount: result.stepCount,
    guidanceScale: result.guidanceScale,
  };
}

async function generateWithHttp({
  prompt,
  steps,
  guidanceScale,
  seed,
}: {
  prompt: string;
  steps: number;
  guidanceScale: number;
  seed?: number;
}): Promise<GenerationResult> {
  const baseUrl = getApiUrl();
  const response = await fetch(new URL("/api/generate-image", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error("Failed to generate image");

  const data = await response.json();

  const fileUri = await saveBase64Image({
    base64: data.b64_json,
    mimeType: data.mimeType,
  });

  return {
    fileUri,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
    stepCount: steps,
    guidanceScale,
  };
}

export default function GenerationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [state, setState] = useState<ScreenState>("idle");
  const [prompt, setPrompt] = useState("A beautiful sunset over mountains");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [steps, setSteps] = useState(25);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const generatedImageRef = useRef<GeneratedImage | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()} pressColor="transparent">
          <ThemedText style={{ color: Colors.dark.text }}>Close</ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton
          onPress={() => {
            if (state === "generating") return;
            handleGenerate();
          }}
          pressColor="transparent"
        >
          <Feather name="zap" size={22} color={Colors.dark.text} />
        </HeaderButton>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, state, prompt, steps, seed, guidanceScale]);

  const handleGenerate = useCallback(async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || state === "generating") return;

    if (Platform.OS === "web") {
      // web stays HTTP (unless you build a web-native generator)
    }

    setState("generating");
    setGeneratedImage(null);
    generatedImageRef.current = null;
    setProgress(0);
    setCurrentStep(0);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const useCoreML = isCoreMLGeneratorAvailable() && !!getCoreMLGenerator();
    const progressController = createProgressController({
      totalSteps: steps,
      stepDurationMs: 200,
      setCurrentStep,
      setProgress,
    });

    const eventEmitter = getCoreMLGeneratorEventEmitter();
    const progressSub = useCoreML
      ? progressController.bindEmitter(eventEmitter, "onGenerationProgress")
      : null;

    try {
      if (!useCoreML) {
        progressController.startInterval();
      }

      const result = useCoreML
        ? await generateWithCoreML({
            prompt: cleanPrompt,
            steps,
            seed: seed ?? undefined,
            guidanceScale,
          })
        : await generateWithHttp({
            prompt: cleanPrompt,
            steps,
            seed: seed ?? undefined,
            guidanceScale,
          });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: cleanPrompt,
        imageData: result.fileUri,
        seed: result.seed,
        steps: result.stepCount,
        guidanceScale: result.guidanceScale,
        createdAt: new Date().toISOString(),
      };

      generatedImageRef.current = newImage;
      setGeneratedImage(result.fileUri);
      progressController.complete(result.stepCount);
      setState("complete");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    } catch (e) {
      console.error("Generation error:", e);
      setState("idle");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );

      Alert.alert(
        "Generation Failed",
        "Unable to generate an image. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      progressController.cleanup();
      progressSub?.remove();
    }
  }, [prompt, state, steps, seed, guidanceScale]);

  const handleSaveAndView = useCallback(async () => {
    const img = generatedImageRef.current;
    if (!img) return;

    try {
      await saveImage(img);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      navigation.replace("ImageDetail", { image: img });
    } catch (e) {
      console.error("Save error:", e);
      Alert.alert("Save Failed", "Unable to save image. Please try again.");
    }
  }, [navigation]);

  const randomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 2147483647);
    setSeed(newSeed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

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
            onPress={() => setAdvancedOpen((v) => !v)}
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
                  onValueChange={(v) => setSteps(Math.round(v))}
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
                  onValueChange={(v) =>
                    setGuidanceScale(Math.round(v * 2) / 2)
                  }
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
                    value={seed !== null ? String(seed) : ""}
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      setSeed(Number.isFinite(num) ? num : null);
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

          <Button onPress={handleGenerate} style={styles.generateButton}>
            Generate
          </Button>
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
          <Button
            onPress={() => {
              setState("idle");
              setProgress(0);
              setCurrentStep(0);
              setGeneratedImage(null);
              generatedImageRef.current = null;
            }}
            style={styles.secondaryButton}
            variant="secondary"
          >
            Make Another
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
  generateButton: {
    marginTop: Spacing.xl,
  },
  progressContainer: {
    marginTop: Spacing["2xl"],
  },
  generatingText: {
    marginTop: Spacing.md,
    textAlign: "center",
    color: Colors.dark.textSecondary,
  },
  resultContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  generatedImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  secondaryButton: {
    marginTop: Spacing.sm,
  },
});
