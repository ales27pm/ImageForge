import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getSettings,
  saveSettings,
  clearAllData,
  type UserSettings,
} from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const TINT_COLORS = [
  "#CD7F32", // Bronze
  "#FFD700", // Gold
  "#00D4FF", // Electric Blue
  "#FF6B6B", // Coral
  "#9B59B6", // Purple
  "#2ECC71", // Green
];

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "Creator",
    tintIntensity: 0.3,
    tintColor: "#CD7F32",
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Save settings error:", error);
      Alert.alert("Save Failed", "Unable to save settings");
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all generated images and reset settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            } catch (error) {
              console.error("Clear data error:", error);
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.avatarSection}>
        <Image
          source={require("../../assets/images/avatar-preset.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
        <TextInput
          style={styles.nameInput}
          value={settings.displayName}
          onChangeText={(text) => updateSetting("displayName", text)}
          placeholder="Your Name"
          placeholderTextColor={Colors.dark.textSecondary}
          textAlign="center"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          Model Management
        </ThemedText>
        <View style={styles.card}>
          <View style={styles.modelStatus}>
            <View style={styles.statusIndicator} />
            <ThemedText type="body">Model Ready</ThemedText>
          </View>
          <ThemedText type="caption" style={styles.modelInfo}>
            Using Gemini AI for image generation
          </ThemedText>
          <Button
            variant="secondary"
            onPress={handleClearCache}
            style={styles.clearButton}
          >
            Clear Cache
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          Rendering
        </ThemedText>
        <View style={styles.card}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <ThemedText type="body">Tint Intensity</ThemedText>
              <ThemedText type="body" style={styles.sliderValue}>
                {Math.round(settings.tintIntensity * 100)}%
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              value={settings.tintIntensity}
              onValueChange={(value) => updateSetting("tintIntensity", value)}
              minimumTrackTintColor={Colors.dark.primary}
              maximumTrackTintColor={Colors.dark.backgroundSecondary}
              thumbTintColor={Colors.dark.primary}
            />
          </View>

          <View style={styles.colorSection}>
            <ThemedText type="body" style={styles.colorLabel}>
              Tint Color
            </ThemedText>
            <View style={styles.colorPicker}>
              {TINT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    settings.tintColor === color && styles.colorSwatchSelected,
                  ]}
                  onPress={() => {
                    updateSetting("tintColor", color);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          About
        </ThemedText>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <ThemedText type="body">Version</ThemedText>
            <ThemedText type="body" style={styles.aboutValue}>
              1.0.0
            </ThemedText>
          </View>
          <Pressable
            style={styles.aboutRow}
            onPress={() => {
              Linking.openURL("https://example.com/privacy");
            }}
          >
            <ThemedText type="body">Privacy Policy</ThemedText>
            <Feather name="external-link" size={18} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>
      </View>

      {hasChanges ? (
        <Button onPress={handleSave} style={styles.saveButton}>
          Save Changes
        </Button>
      ) : null}
    </KeyboardAwareScrollViewCompat>
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
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
    minWidth: 150,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modelStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.success,
  },
  modelInfo: {
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
  },
  clearButton: {
    marginTop: Spacing.sm,
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
  colorSection: {},
  colorLabel: {
    marginBottom: Spacing.md,
  },
  colorPicker: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: Colors.dark.text,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  aboutValue: {
    color: Colors.dark.textSecondary,
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
