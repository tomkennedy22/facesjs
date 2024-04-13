import { HEX, HSL, RGB } from "../src/types";

export const deleteFromDict = (obj: any, key: string): any => {
  const keyParts: string[] = key.split(".");
  let current: any = obj;

  for (let i = 0; i < keyParts.length - 1; i++) {
    const part: string = keyParts[i] as string;

    if (!current[part] || typeof current[part] !== "object") {
      return obj;
    }

    current = current[part];
  }

  const lastPart = keyParts[keyParts.length - 1];
  if (lastPart !== undefined) {
    delete current[lastPart];
  }

  return obj;
};

export const getFromDict = (obj: object, key: string): any => {
  let keyParts: string[] = key.split(".");
  let current: any = obj;

  for (let part of keyParts) {
    if (current instanceof Map) {
      if (!current.has(part)) {
        return null;
      }
      current = current.get(part);
    } else if (typeof current === "object" && current !== null) {
      if (!(part in current)) {
        return null;
      }
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
};

export const setToDict = (
  container: { [key: string]: any } | Map<any, any>,
  key: string,
  value: any,
) => {
  const keys: string[] = key.trim().split(".");
  let current_container = container;

  for (let [ind, currentKey] of keys.entries()) {
    if (ind === keys.length - 1) {
      if (current_container instanceof Map) {
        current_container.set(currentKey, value);
      } else {
        (current_container as { [key: string]: any })[currentKey] = value;
      }
    } else {
      if (current_container instanceof Map) {
        if (
          !current_container.has(currentKey) ||
          !(current_container.get(currentKey) instanceof Map)
        ) {
          current_container.set(currentKey, new Map<any, any>());
        }
        current_container = current_container.get(currentKey);
      } else {
        if (
          !current_container[currentKey] ||
          typeof current_container[currentKey] !== "object"
        ) {
          (current_container as { [key: string]: any })[currentKey] = {};
        }
        current_container = current_container[currentKey];
      }
    }
  }

  return container;
};

export const generateRangeFromStep = (
  start: number,
  end: number,
  step: number,
): number[] => {
  if (step <= 0) {
    throw new Error("Step must be greater than 0");
  }
  if (start > end && step > 0) {
    throw new Error("Start cannot be greater than end when step is positive");
  }

  let returnArray: number[] = [];
  let track = start;
  while (track <= end) {
    returnArray.push(track);
    track = roundTwoDecimals(track + step);
  }

  return returnArray;
};

export const generateRangeFromSlots = (
  start: number,
  end: number,
  slots: number,
): number[] => {
  let returnArray: number[] = [];

  if (slots === 0) {
    return returnArray;
  }
  if (slots === 1) {
    return [start, end];
  }
  if (start === end) {
    return [start];
  }
  if (start > end) {
    [start, end] = [end, start];
  }

  let step = (end - start) / slots;

  for (let i = start; i <= end; i += step) {
    returnArray.push(roundTwoDecimals(i));
  }

  return returnArray;
};

export const distinct = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

export const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

// flattenDict is used to flatten a nested object into a single level object
// Turns {a: {b: {c: 1, d: 2}}} into {'a.b.c': 1, 'a.b.d': 2}
export const flattenDict = (obj: any | any[], parentKey = "", result = {}) => {
  const objIsArray = Array.isArray(obj);

  for (const [key, value] of Object.entries(obj)) {
    const storeKey = objIsArray ? `[${key}]` : key;
    let newKey = parentKey ? `${parentKey}.${storeKey}` : storeKey;

    if (value && (Array.isArray(value) || typeof value === "object")) {
      flattenDict(value, newKey, result);
    } else {
      // @ts-ignore
      result[newKey] = value;
    }
  }
  return result;
};

// objStringifyInOrder is used to stringify objects in a consistent order, flattening nested objects then sorting keys
export const objStringifyInOrder = (obj: any): string => {
  let flattenedObj = flattenDict(obj);

  let returnString = "";

  Object.keys(flattenedObj)
    .sort()
    .forEach((key) => {
      // @ts-ignore
      returnString += `${key}: ${flattenedObj[key]}\n`;
    });

  return returnString;
};

export const deepCopy = <T>(value: T): T => {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepCopy(item)) as unknown as T;
  }

  const copiedObject: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    copiedObject[key] = deepCopy(val);
  }

  return copiedObject as T;
};

export const concatClassNames = (...classNames: string[]): string => {
  let joinedClassNames = classNames.join(" ");
  return joinedClassNames.trim().replace(/\s+/g, " ");
};

export const luma = (colorHex: string): number => {
  if (!doesStrLookLikeColor(colorHex)) {
    throw new Error("Invalid hexadecimal color");
  }

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let hex = colorHex.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const doesStrLookLikeColor = (str: string): boolean => {
  const regex = /^#([0-9A-F]{3}){1,2}$/i;

  return regex.test(str);
};

export const isValidJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};

export const pickRandom = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const safeEncodeBase64 = (str: string): string | null => {
  try {
    return btoa(str);
  } catch (e) {
    console.log("Error encoding base64 parameter:", { e, str });
    return null;
  }
};

const safeDecodeBase64 = (str: string): string | null => {
  try {
    return atob(str);
  } catch (e) {
    console.log("Error decoding base64 parameter:", { e, str });
    return null;
  }
};

export const encodeJSONForUrl = (input: {
  [key: string]: any;
}): string | null => {
  return safeEncodeBase64(JSON.stringify(input));
};

export const decodeFromUrlToJSON = (
  paramOptions: (string | undefined)[],
): { [key: string]: any } => {
  paramOptions = paramOptions.filter((param) => param && param.length > 0);
  paramOptions = paramOptions.map((param) => [param, param!.slice(1)]).flat();

  let decodedString = paramOptions
    .map((param) => safeDecodeBase64(param!))
    .find((decodedString) => decodedString !== null);

  if (decodedString) {
    try {
      return JSON.parse(decodedString);
    } catch (e) {
      console.error("Error parsing JSON from decoded string:", e);
    }
  }

  return {};
};

export const getCurrentTimestampAsString = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");

  return `${year}${month}${day}${hour}${minute}${second}`;
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
  let l: number = (max + min) / 2;

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
  let { h, s, l } = hsl;

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
