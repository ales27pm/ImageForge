import { Platform } from "react-native";
import { documentDirectory, EncodingType, makeDirectoryAsync, writeAsStringAsync } from "expo-file-system";

const IMAGE_DIRECTORY = documentDirectory ? `${documentDirectory}generated/` : null;

export async function saveBase64Image({
  base64,
  mimeType,
}: {
  base64: string;
  mimeType: string;
}): Promise<string> {
  if (Platform.OS === "web" || !IMAGE_DIRECTORY) {
    return `data:${mimeType};base64,${base64}`;
  }

  try {
    await makeDirectoryAsync(IMAGE_DIRECTORY, { intermediates: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("exists")) {
      throw error;
    }
  }

  let extension = "png";
  if (typeof mimeType === "string" && mimeType.includes("/")) {
    const parts = mimeType.split("/");
    if (parts[1] && /^[a-zA-Z0-9]+$/.test(parts[1])) {
      extension = parts[1];
    } else {
      console.warn(`Invalid mimeType extension: '${mimeType}', defaulting to .png`);
    }
  } else {
    console.warn(`Missing or malformed mimeType: '${mimeType}', defaulting to .png`);
  }

  const filename = `aiimageforge_${Date.now()}.${extension}`;
  const fileUri = `${IMAGE_DIRECTORY}${filename}`;

  await writeAsStringAsync(fileUri, base64, { encoding: EncodingType.Base64 });
  return fileUri;
}
