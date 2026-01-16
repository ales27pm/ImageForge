import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  cacheDirectory,
  EncodingType,
  writeAsStringAsync,
} from "expo-file-system";
import * as Sharing from "expo-sharing";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { applyAlphaToHex, hexToRgbFloat } from "@/lib/color";
import {
  defaultSettings,
  deleteImage,
  getSettings,
  type UserSettings,
} from "@/lib/storage";
import {
  MetalImageView,
  isMetalImageViewAvailable,
} from "@/native/MetalImageViewNative";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ImageDetail">;

export default function ImageDetailScreen({ navigation, route }: Props) {
  const { image } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const drawerHeight = useSharedValue(0);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton
          onPress={() => navigation.goBack()}
          pressColor="transparent"
        >
          <ThemedText style={{ color: Colors.dark.text }}>Done</ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton onPress={handleShare} pressColor="transparent">
          <Feather name="share" size={22} color={Colors.dark.text} />
        </HeaderButton>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;
    getSettings()
      .then((storedSettings) => {
        if (isMounted) {
          setSettings(storedSettings);
        }
      })
      .catch((error) => {
        console.error("Settings load error:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (Platform.OS === "web") {
        Alert.alert("Share", "Sharing is not available on web");
        return;
      }

      if (image.imageData.startsWith("file://")) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(image.imageData);
        } else {
          await Share.share({
            url: image.imageData,
            message: `Check out this AI-generated image! Prompt: ${image.prompt}`,
          });
        }
        return;
      }

      const base64Data = image.imageData.split(",")[1];
      if (!cacheDirectory) {
        throw new Error("Cache directory unavailable");
      }

      const filename = `aiimageforge_${image.id}.png`;
      const fileUri = `${cacheDirectory}${filename}`;

      await writeAsStringAsync(fileUri, base64Data, {
        encoding: EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        await Share.share({
          message: `Check out this AI-generated image! Prompt: ${image.prompt}`,
        });
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Share Failed", "Unable to share image");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImage(image.id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              navigation.goBack();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Delete Failed", "Unable to delete image");
            }
          },
        },
      ],
    );
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    drawerHeight.value = withSpring(drawerOpen ? 0 : 1, {
      damping: 15,
      stiffness: 120,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const drawerStyle = useAnimatedStyle(() => ({
    maxHeight: drawerHeight.value === 1 ? 500 : 120,
  }));

  const tintColor = useMemo(
    () => hexToRgbFloat(settings.tintColor),
    [settings.tintColor],
  );

  const overlayColor = useMemo(
    () => applyAlphaToHex(settings.tintColor, settings.tintIntensity),
    [settings.tintColor, settings.tintIntensity],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + 280,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          {isMetalImageViewAvailable &&
            (image.imageData.startsWith("file://") || /^[A-Za-z]:\\|\//.test(image.imageData)) ? (
            <MetalImageView
              imageUri={image.imageData}
              tintColor={tintColor}
              tintIntensity={settings.tintIntensity}
              style={styles.image}
            />
          ) : (
            <>
              <Image
                source={{ uri: image.imageData }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
              <View
                style={[styles.metalOverlay, { backgroundColor: overlayColor }]}
              />
            </>
          )}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.drawer,
          { paddingBottom: insets.bottom + Spacing.lg },
          drawerStyle,
        ]}
      >
        <Pressable style={styles.drawerHandle} onPress={toggleDrawer}>
          <View style={styles.handleBar} />
        </Pressable>

        <View style={styles.drawerContent}>
          <View style={styles.metadataRow}>
            <ThemedText type="caption">Created</ThemedText>
            <ThemedText type="small">{formatDate(image.createdAt)}</ThemedText>
          </View>

          {drawerOpen ? (
            <>
              <View style={styles.promptSection}>
                <ThemedText type="caption" style={styles.sectionLabel}>
                  Prompt
                </ThemedText>
                <ThemedText type="body" style={styles.promptText}>
                  {image.prompt}
                </ThemedText>
              </View>

              <View style={styles.parametersSection}>
                <ThemedText type="caption" style={styles.sectionLabel}>
                  Parameters
                </ThemedText>
                <View style={styles.parametersGrid}>
                  <View style={styles.parameterItem}>
                    <ThemedText type="caption">Steps</ThemedText>
                    <ThemedText type="body">{image.steps}</ThemedText>
                  </View>
                  <View style={styles.parameterItem}>
                    <ThemedText type="caption">Guidance</ThemedText>
                    <ThemedText type="body">{image.guidanceScale}</ThemedText>
                  </View>
                  <View style={styles.parameterItem}>
                    <ThemedText type="caption">Seed</ThemedText>
                    <ThemedText type="body">{image.seed}</ThemedText>
                  </View>
                </View>
              </View>

              <Button
                variant="destructive"
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                Delete Image
              </Button>
            </>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.dark.backgroundDefault,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  metalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${Colors.dark.primary}08`,
    pointerEvents: "none",
  },
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.backgroundDefault,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  drawerHandle: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 2,
  },
  drawerContent: {
    paddingHorizontal: Spacing.xl,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  promptSection: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.xs,
    color: Colors.dark.textSecondary,
  },
  promptText: {
    color: Colors.dark.text,
  },
  parametersSection: {
    marginTop: Spacing.xl,
  },
  parametersGrid: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  parameterItem: {
    gap: Spacing.xs,
  },
  deleteButton: {
    marginTop: Spacing["2xl"],
  },
});
