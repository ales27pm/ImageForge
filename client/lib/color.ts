const DEFAULT_RGB: [number, number, number] = [1, 1, 1];

function normalizeHex(hex: string): string | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (normalized.length === 3) {
    if (!/^[0-9a-fA-F]{3}$/.test(normalized)) {
      return null;
    }
    return normalized
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase();
  }
  if (normalized.length === 6 && /^[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toLowerCase();
  }
  return null;
}

export function hexToRgbFloat(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return DEFAULT_RGB;
  }

  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  return [red, green, blue];
}

export function applyAlphaToHex(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex) ?? "ffffff";
  const clamped = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${normalized}${alphaHex}`;
}
