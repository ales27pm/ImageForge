import AsyncStorage from "@react-native-async-storage/async-storage";

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageData: string;
  seed: number;
  steps: number;
  guidanceScale: number;
  createdAt: string;
}

export interface UserSettings {
  displayName: string;
  tintIntensity: number;
  tintColor: string;
}

const IMAGES_KEY = "@aiimageforge/images";
const SETTINGS_KEY = "@aiimageforge/settings";

export const defaultSettings: UserSettings = {
  displayName: "Creator",
  tintIntensity: 0.3,
  tintColor: "#CD7F32",
};

export async function getImages(): Promise<GeneratedImage[]> {
  try {
    const data = await AsyncStorage.getItem(IMAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading images:", error);
    return [];
  }
}

export async function saveImage(image: GeneratedImage): Promise<void> {
  try {
    const images = await getImages();
    images.unshift(image);
    await AsyncStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch (error) {
    console.error("Error saving image:", error);
    throw error;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    const images = await getImages();
    const filtered = images.filter((img) => img.id !== id);
    await AsyncStorage.setItem(IMAGES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (error) {
    console.error("Error loading settings:", error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([IMAGES_KEY, SETTINGS_KEY]);
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
}
