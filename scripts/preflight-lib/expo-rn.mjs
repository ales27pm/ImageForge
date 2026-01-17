// Expo/RN version mapping for preflight
export const sdkToRn = {
  '54': '0.81',
  // Add more as needed
};

export function getExpoSdkMajor(version) {
  // Accepts 54.0.0, ^54.0.0, etc.
  const m = String(version).match(/(\d{2,})/);
  return m ? m[1] : undefined;
}
