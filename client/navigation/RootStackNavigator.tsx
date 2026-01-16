import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import GalleryScreen from "@/screens/GalleryScreen";
import GenerationScreen from "@/screens/GenerationScreen";
import ImageDetailScreen from "@/screens/ImageDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import type { GeneratedImage } from "@/lib/storage";

export type RootStackParamList = {
  Gallery: undefined;
  Generation: undefined;
  ImageDetail: { image: GeneratedImage };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          headerTitle: "Gallery",
        }}
      />
      <Stack.Screen
        name="Generation"
        component={GenerationScreen}
        options={{
          presentation: "modal",
          headerTitle: "Create",
        }}
      />
      <Stack.Screen
        name="ImageDetail"
        component={ImageDetailScreen}
        options={{
          presentation: "modal",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
    </Stack.Navigator>
  );
}
