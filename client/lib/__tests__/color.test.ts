import { applyAlphaToHex, hexToRgbFloat } from "../color";

describe("color helpers", () => {
  it("converts hex to normalized rgb floats", () => {
    expect(hexToRgbFloat("#cd7f32")).toEqual([205 / 255, 127 / 255, 50 / 255]);
  });

  it("handles shorthand hex values", () => {
    expect(hexToRgbFloat("#abc")).toEqual([0xaa / 255, 0xbb / 255, 0xcc / 255]);
  });

  it("falls back to white for invalid values", () => {
    expect(hexToRgbFloat("not-a-color")).toEqual([1, 1, 1]);
  });

  it("applies alpha to hex colors", () => {
    expect(applyAlphaToHex("#cd7f32", 0.5)).toBe("#cd7f3280");
  });
});
