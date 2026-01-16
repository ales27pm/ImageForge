import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";

import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ImageCard } from "@/components/ImageCard";
import { EmptyGallery } from "@/components/EmptyGallery";
import { SkeletonCard } from "@/components/SkeletonCard";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Colors, Spacing } from "@/constants/theme";
import { getImages, type GeneratedImage } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

type Props = NativeStackScreenProps<RootStackParamList, "Gallery">;

export default function GalleryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title="AIImageForge" />,
      headerRight: () => (
        <HeaderButton
          onPress={() => navigation.navigate("Settings")}
          pressColor="transparent"
        >
          <Feather name="settings" size={22} color={Colors.dark.text} />
        </HeaderButton>
      ),
    });
  }, [navigation]);

  const loadImages = useCallback(async () => {
    try {
      const data = await getImages();
      setImages(data);
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadImages();
    }, [loadImages])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadImages();
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: GeneratedImage; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={styles.cardWrapper}
      >
        <ImageCard
          image={item}
          onPress={() => navigation.navigate("ImageDetail", { image: item })}
        />
      </Animated.View>
    ),
    [navigation]
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.cardWrapper}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View
          style={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + 100,
            },
          ]}
        >
          {renderSkeletons()}
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + 100,
            },
          ]}
          columnWrapperStyle={styles.row}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.primary}
            />
          }
          ListEmptyComponent={<EmptyGallery />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <FloatingActionButton
        onPress={() => navigation.navigate("Generation")}
        style={[styles.fab, { bottom: insets.bottom + Spacing["2xl"] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  cardWrapper: {
    marginBottom: Spacing.lg,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
  },
});
