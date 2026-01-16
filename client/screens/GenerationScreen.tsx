// --- Progress controller helper ---
function createProgressController({
  totalSteps,
  stepDuration,
  setCurrentStep,
  setProgress,
}: {
  totalSteps: number;
  stepDuration: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}) {
  let interval: ReturnType<typeof setInterval> | null = null;

  const startInterval = () => {
    interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = Math.min(prev + 1, totalSteps);
        setProgress(next / totalSteps);
        return next;
      });
    }, stepDuration);
  };

  const bindEmitter = (
    emitter: ReturnType<typeof getCoreMLGeneratorEventEmitter> | undefined,
    eventName: string,
  ) => {
    return (
      emitter?.addListener(eventName, (event: CoreMLGenerationProgressEvent) => {
        const total = event?.totalSteps ?? totalSteps;
        const step = event?.step ?? 0;
        setCurrentStep(step);
        if (total > 0) setProgress(Math.min(step / total, 1));
      }) ?? null
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
// --- Generation helpers ---
type GenerationResult = {
  fileUri: string;
  seed: number;
  stepCount: number;
  guidanceScale: number;
};

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
  const coreMLGenerator = getCoreMLGenerator();
  if (!coreMLGenerator) {
    throw new Error("CoreML generator not available");
  }
  const result = await coreMLGenerator.generate(prompt, {
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
  if (!response.ok) {
    throw new Error("Failed to generate image");
  }
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
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { HeaderButton } from "@react-navigation/elements";
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState("generating");
    setProgress(0);
    setCurrentStep(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const useCoreML = isCoreMLGeneratorAvailable() && !!getCoreMLGenerator();
    const totalSteps = steps;
    const stepDuration = 200;
    const progressController = createProgressController({
      totalSteps,
      stepDuration,
      setCurrentStep,
      setProgress,
    });
    const eventEmitter = getCoreMLGeneratorEventEmitter();
    const progressSubscription = useCoreML
      ? progressController.bindEmitter(eventEmitter, "onGenerationProgress")
      : null;

    try {
      if (!useCoreML) {
        progressController.startInterval();
      }

      const result = useCoreML
        ? await generateWithCoreML({
            prompt: prompt.trim(),
            steps,
            seed: seed ?? undefined,
            guidanceScale,
          })
        : await generateWithHttp({
            prompt: prompt.trim(),
            steps,
            guidanceScale,
            seed: seed ?? undefined,
          });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      progressController.cleanup();
      console.error("Generation error:", error);
      setState("idle");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Generation Failed",
        "Unable to generate image. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      progressController.cleanup();
      progressSubscription?.remove();
    }
  };
          guidanceScale,
          width: 512,
          height: 512,
        });

        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          imageData: result.fileUri,
          seed: result.seed,
          steps: result.stepCount,
          guidanceScale: result.guidanceScale,
          createdAt: new Date().toISOString(),
        };

        generatedImageRef.current = newImage;
        setGeneratedImage(result.fileUri);
        setProgress(1);
        setCurrentStep(result.stepCount);
        setState("complete");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/generate-image", baseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      const imageData = await saveBase64Image({
        base64: data.b64_json,
        mimeType: data.mimeType,
      });

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
      setProgress(1);
      setCurrentStep(totalSteps);
      setState("complete");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error("Generation error:", error);
      setState("idle");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Generation Failed",
        "Unable to generate image. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      progressSubscription?.remove();
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
