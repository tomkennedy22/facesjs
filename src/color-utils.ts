import { RGB, HSL, HEX, RGBA } from "./types";
// @ts-ignore
import paper from "paper-jsdom";

// Convert hex color to RGB
export const hexToRgb = (hex: HEX): RGB | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB color to hex
export const rgbToHex = (rgb: RGB): HEX => {
  return (
    "#" +
    ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
  );
};

// Convert RGB color to HSL
export const rgbToHsl = (rgb: RGB): HSL => {
  let { r, g, b } = rgb;
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = (max + min) / 2;
  let s: number = (max + min) / 2;
  const l: number = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (r === max) {
      h = (g - b) / d + (g < b ? 6 : 0);
    }
    if (g === max) {
      h = (b - r) / d + 2;
    }
    if (b === max) {
      h = (r - g) / d + 4;
    }

    h = h / 6;
  }

  return { h, s, l };
};

// Convert HSL color to RGB
export const hslToRgb = (hsl: HSL): RGB => {
  let r, g, b;
  const { h, s, l } = hsl;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const hexToHsl = (hex: HEX): HSL | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return null;
  }
  return rgbToHsl(rgb);
};

export const rgbaToRgbaString = (rgba: RGB | null, opacity: number): string => {
  if (!rgba) {
    return "rgba(0, 0, 0, 0)";
  }
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${opacity})`;
};

export const rgbaStringToRgba = (rgbaString: string): RGBA => {
  const rgba = rgbaString.split("(")[1].split(")")[0].split(",");
  return {
    r: parseInt(rgba[0]),
    g: parseInt(rgba[1]),
    b: parseInt(rgba[2]),
    a: parseInt(rgba[3]),
  };
};

export const adjustShade = (color: string, amount: number): string => {
  // Convert hex to RGB
  const rgb: RGB | null = hexToRgb(color);

  // Convert RGB to HSL
  if (!rgb) {
    return color;
  }
  const hsl: HSL = rgbToHsl(rgb);

  // Adjust the lightness
  const adjustedLightness = Math.max(0, Math.min(1, hsl.l * amount));

  // Convert HSL back to RGB
  const adjustedRgb = hslToRgb({ ...hsl, l: adjustedLightness });

  // Convert RGB back to hex
  const adjustedHex = rgbToHex(adjustedRgb);

  return adjustedHex;
};
