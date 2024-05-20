import override from "./override.js";
import svgs from "./svgs.js";
import {
  FaceConfig,
  Overrides,
  RGB,
  HSL,
  HEX,
  FeatureInfo,
  SvgMetadata,
} from "./types";
// @ts-ignore
import paper from "paper-jsdom";
import { legacyNameMap, svgsMetadata } from "./svgs-index.js";

const getChildElement = (
  svg: SVGSVGElement,
  insertPosition: "afterbegin" | "beforeend",
) => {
  if (insertPosition === "afterbegin") {
    return svg.firstChild;
  } else {
    return svg.lastChild;
  }
};

const clipToParent = (
  fullSvg: SVGSVGElement,
  parentElement: any,
  insertLocation: "afterbegin" | "beforeend",
) => {
  const childElement = getChildElement(
    fullSvg,
    insertLocation,
  ) as SVGSVGElement;
  const clippedItem = paper.project.importSVG(childElement);
  fullSvg.removeChild(childElement);
  const baseShape = unitePaths(findPathItems(parentElement.clone()));

  const smallChildren = findPathItems(clippedItem);
  const childGroup = new paper.Group();
  for (const child of smallChildren) {
    child.stroke = null;
    child.strokeWidth = 0;

    const intersection = baseShape.intersect(child);

    intersection.fillColor = child.fillColor;
    intersection.strokeColor = child.strokeColor;
    intersection.strokeWidth = child.strokeWidth;

    childGroup.addChild(intersection);
  }

  const resultSVG = childGroup.exportSVG({ asString: true });
  fullSvg.insertAdjacentHTML(insertLocation, resultSVG);

  childGroup.remove();

  const newlyAddedElement = getChildElement(
    fullSvg,
    insertLocation,
  ) as SVGSVGElement;
  addClassToElement(newlyAddedElement, "clipToParent");
};

const findPathItems = (item: paper.Item): paper.PathItem[] => {
  let paths: paper.PathItem[] = [];

  if (item.children) {
    item.children.forEach((child: any) => {
      paths = paths.concat(findPathItems(child));
    });
  }
  if (item instanceof paper.PathItem) {
    paths.push(item);
  }

  return paths;
};

const unitePaths = (paths: paper.PathItem[]): paper.Path => {
  const unitedPath = paths.reduce(
    (result, path) => {
      if (result) {
        result = result.unite(path);
      } else {
        result = path;
      }
      return result;
    },
    null as paper.PathItem | null,
  ) as paper.Path;

  return unitedPath;
};

const getOuterStroke = (svgElement: SVGElement): string => {
  paper.setup(document.createElement("canvas"));

  const importedItem = paper.project.importSVG(svgElement);

  const pathItems = findPathItems(importedItem);
  for (const path of pathItems) {
    if (path.clockwise) {
      path.reverse();
    }
  }
  const unitedPath = unitePaths(pathItems);

  unitedPath.strokeColor = new paper.Color("black");
  unitedPath.strokeWidth = 6;
  unitedPath.fillColor = new paper.Color("transparent");

  // Remove the imported item and its children from the project
  importedItem.remove();

  return unitedPath.exportSVG({ asString: true });
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

export const randomGaussian = (min: number, max: number) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) num = randomGaussian(min, max);
  num *= max - min;
  num += min;
  return num;
};

const adjustShade = (color: string, amount: number): string => {
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

const getSkinAccent = (skinColor: string): string => {
  const hsl = hexToHsl(skinColor);
  if (!hsl) {
    return skinColor;
  }

  const modifiedLVals: number[] = [hsl.l * 0.9, hsl.l ** 2, (1 - hsl.l) * 1.25];
  const lFurthestFromHalf: number[] = modifiedLVals.sort(
    (a, b) => Math.abs(b - 0.5) - Math.abs(a - 0.5),
  );

  hsl.l = lFurthestFromHalf[0] as number;
  return rgbToHex(hslToRgb(hsl));
};

const getHairAccent = (hairColor: string): string => {
  const hsl = hexToHsl(hairColor);
  if (!hsl) {
    return hairColor;
  }
  if (hsl.l < 0.33) {
    return adjustShade(hairColor, 2);
  } else {
    return adjustShade(hairColor, 0.5);
  }
};

const addClassToElement = (element: SVGGraphicsElement, className: string) => {
  const existingClass = element.getAttribute("class");
  const existingClassSet = new Set(existingClass?.split(" ") || []);
  existingClassSet.add(className);
  element.setAttribute("class", Array.from(existingClassSet).join(" "));
};

const addWrapper = (svgString: string, objectTitle?: string) =>
  `<g class="${objectTitle}">${svgString}</g>`;

const addTransform = (element: SVGGraphicsElement, newTransform: string) => {
  const oldTransform = element.getAttribute("transform");
  element.setAttribute(
    "transform",
    `${oldTransform ? `${oldTransform} ` : ""}${newTransform}`,
  );
};

const rotateCentered = (element: SVGGraphicsElement, angle: number) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  addTransform(element, `rotate(${angle} ${cx} ${cy})`);
};

// const mirrorElement = (element: SVGGraphicsElement) => {

//   const bbox = element.getBBox();
//   const middleX = bbox.x + bbox.width / 2;
//   const distanceFromMiddle = middleX - 200;

//   addTransform(element, `translate(${-1 * distanceFromMiddle * 2}, 0)`);
// }

const scaleStrokeWidthAndChildren = (
  element: SVGGraphicsElement,
  factor: number,
) => {
  if (element.tagName === "style") {
    return;
  }

  const strokeWidth = element.getAttribute("stroke-width");
  if (strokeWidth) {
    element.setAttribute(
      "stroke-width",
      String(parseFloat(strokeWidth) / factor),
    );
  }
  const children = element.childNodes as unknown as SVGGraphicsElement[];
  for (let i = 0; i < children.length; i++) {
    scaleStrokeWidthAndChildren(children[i], factor);
  }
};

const setStrokeColorAndChildren = (
  element: SVGGraphicsElement,
  color: string,
) => {
  if (element.tagName === "style") {
    return;
  }

  element.setAttribute("stroke", color);
  const children = element.childNodes as unknown as SVGGraphicsElement[];
  for (let i = 0; i < children.length; i++) {
    setStrokeColorAndChildren(children[i], color);
  }
};

// Scale relative to the center of bounding box of element e, like in Raphael.
// Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
const scaleCentered = (element: SVGGraphicsElement, x: number, y: number) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const tx = (cx * (1 - x)) / x;
  const ty = (cy * (1 - y)) / y;

  addTransform(element, `scale(${x} ${y}) translate(${tx} ${ty})`);

  // Keep apparent stroke width constant, similar to how Raphael does it (I think)
  if (
    Math.abs(x) !== 1 ||
    Math.abs(y) !== 1 ||
    Math.abs(x) + Math.abs(y) !== 2
  ) {
    const factor = (Math.abs(x) + Math.abs(y)) / 2;
    scaleStrokeWidthAndChildren(element, factor);
  }
};

const scaleTopDown = (element: SVGGraphicsElement, scaleY: number) => {
  const bbox = element.getBBox();

  const initialTotalY = bbox.height + bbox.y;
  const newTotalY = bbox.height * scaleY + bbox.y;

  let ty = initialTotalY - newTotalY;

  // Do this as scaling Y sub-1 makes the SVG contract towards the middle
  //    So we add on the lost size, PLUS 50% of contraction to account for that movement towards middle
  if (ty > 0) {
    ty *= 1.5;
  }

  addTransform(element, `scale(${1} ${scaleY}) translate(0 ${ty})`);
};

// Translate element such that its center is at (x, y). Specifying xAlign and yAlign can instead make (x, y) the left/right and top/bottom.
const translate = (
  element: SVGGraphicsElement,
  x: number,
  y: number,
  xAlign = "center",
  yAlign = "center",
) => {
  const bbox = element.getBBox();
  let cx;
  let cy;
  if (xAlign === "left") {
    cx = bbox.x;
  } else if (xAlign === "right") {
    cx = bbox.x + bbox.width;
  } else {
    cx = bbox.x + bbox.width / 2;
  }
  if (yAlign === "top") {
    cy = bbox.y;
  } else if (yAlign === "bottom") {
    cy = bbox.y + bbox.height;
  } else {
    cy = bbox.y + bbox.height / 2;
  }

  addTransform(element, `translate(${x - cx} ${y - cy})`);
};

// Defines the range of fat/skinny, relative to the original width of the default head.
const fatScale = (fatness: number) => 0.8 + 0.2 * fatness;

// Shotest/tallest range is only 0.85 to 1.15
// @ts-ignore
const heightScale = (height: number) => 0.85 + 0.3 * height;

const drawFeature = (
  svg: SVGSVGElement,
  face: FaceConfig,
  info: FeatureInfo,
  feature: any,
  metadata: SvgMetadata,
) => {
  if (!feature || !svgs[info.name]) {
    return;
  }
  if (
    ["hat", "hat2", "hat3"].includes(face.accessories.id) &&
    info.name == "hair"
  ) {
    if (
      [
        "afro",
        "afro2",
        "curly",
        "curly2",
        "curly3",
        "faux-hawk",
        "hair",
        "high",
        "juice",
        "messy-short",
        "messy",
        "middle-part",
        "parted",
        "shaggy1",
        "shaggy2",
        "short3",
        "spike",
        "spike2",
        "spike3",
        "spike4",
      ].includes(face.hair.id)
    ) {
      face.hair.id = "short";
    } else if (
      [
        "blowoutFade",
        "curlyFade1",
        "curlyFade2",
        "dreads",
        "fauxhawk-fade",
        "tall-fade",
      ].includes(face.hair.id)
    ) {
      face.hair.id = "short-fade";
    } else {
      return;
    }
  }

  if (
    ["suit", "suit2"].includes(face.jersey.id) &&
    (info.name == "accessories" ||
      info.name == "glasses" ||
      info.name == "earring")
  ) {
    //Don't show headband, facemask, etc if person is wearing a suit
    //might be a smarter way to do that includes statement, but wanted to throw in all non-jersey clothing. Only those 2 right now
    return;
  }

  // Dont let huge muscles be outside bounds of suit/referee jersey
  if (
    ["suit", "suit2", "referee"].includes(face.jersey.id) &&
    info.name == "body"
  ) {
    feature.id = "body";
  }

  // @ts-ignore
  let featureSVGString = svgs[info.name][feature.id];
  if (!featureSVGString) {
    return;
  }

  // @ts-ignore
  if (feature.shave) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace("$[faceShave]", feature.shave);
  }

  // @ts-ignore
  if (feature.shave) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace("$[headShave]", "none");
  }

  featureSVGString = featureSVGString.replace("$[skinColor]", face.body.color);
  featureSVGString = featureSVGString.replace(
    /\$\[hairColor\]/g,
    face.hair.color,
  );
  featureSVGString = featureSVGString.replace(
    /\$\[eyeColor\]/g,
    face.eye.color,
  );
  featureSVGString = featureSVGString.replace(
    /\$\[primary\]/g,
    face.teamColors[0],
  );
  featureSVGString = featureSVGString.replace(
    /\$\[secondary\]/g,
    face.teamColors[1],
  );
  featureSVGString = featureSVGString.replace(
    /\$\[accent\]/g,
    face.teamColors[2],
  );

  if (featureSVGString.includes("$[hairAccent]")) {
    const hairAccent = getHairAccent(face.hair.color as string) || "#000";
    featureSVGString = featureSVGString.replace(
      /\$\[hairAccent\]/g,
      hairAccent,
    );
  }

  if (featureSVGString.includes("$[skinAccent]")) {
    const skinAccent = getSkinAccent(face.body.color);
    featureSVGString = featureSVGString.replace(
      /\$\[skinAccent\]/g,
      skinAccent,
    );
  }

  featureSVGString = featureSVGString.replace(
    /\$\[shaveOpacity\]/g,
    // @ts-ignore
    feature.shaveOpacity || 0,
  );

  featureSVGString = featureSVGString.replace(/\$\[headShave\]/g, "none");

  const bodySize = face.body.size !== undefined ? face.body.size : 1;
  const insertPosition: "afterbegin" | "beforeend" = info.placeBeginning
    ? "afterbegin"
    : "beforeend";

  for (let i = 0; i < info.positions.length; i++) {
    svg.insertAdjacentHTML(
      insertPosition,
      addWrapper(featureSVGString, info.name),
    );
    const childElement = getChildElement(svg, insertPosition) as SVGSVGElement;

    for (const granchildElement of childElement.children) {
      addClassToElement(granchildElement as SVGGraphicsElement, feature.id);
    }

    const position = info.positions[i];

    if (position !== null) {
      // Special case, for the pinocchio nose it should not be centered but should stick out to the left or right
      let xAlign;
      if (feature.id === "nose4" || feature.id === "pinocchio") {
        // @ts-ignore
        xAlign = feature.flip ? "right" : "left";
      } else {
        xAlign = "center";
      }

      // @ts-ignore
      if (feature.distance) {
        const move_direction = i == 1 ? 1 : -1;
        // @ts-ignore
        position[0] += move_direction * feature.distance;
      }

      const shiftDirection = i == 1 ? 1 : -1;
      if (info.shiftWithEyes) {
        // @ts-ignore
        position[0] += shiftDirection * (face.eye.distance || 0);
        position[1] += -1 * (face.eye.height || 0);
        // position[1] += 1 * 50 * (1 - fatScale(face.height));
      }

      translate(
        childElement as SVGGraphicsElement,
        position[0],
        position[1],
        xAlign,
      );
    }

    if (feature.hasOwnProperty("angle") && !metadata.noAngle) {
      // @ts-ignore
      rotateCentered(childElement, (i === 0 ? 1 : -1) * feature.angle);
    }

    // Flip if feature.flip is specified or if this is the second position (for eyes and eyebrows). Scale if feature.size is specified.
    // @ts-ignore
    const scale = feature.hasOwnProperty("size") ? feature.size : 1;
    if (info.name === "body" || info.name === "jersey") {
      scaleCentered(childElement, bodySize, 1);
      // @ts-ignore
    } else if (feature.flip || i === 1) {
      scaleCentered(childElement, -scale, scale);
    } else if (scale !== 1) {
      scaleCentered(childElement, scale, scale);
    }

    // @ts-ignore
    // if (feature.mirror) {
    //   mirrorElement(childElement as SVGGraphicsElement);
    // }

    if (feature.hasOwnProperty("opacity")) {
      // @ts-ignore
      childElement.setAttribute("opacity", String(feature.opacity));
    }

    // For stroke editability, mostly face lines that are configurable
    if (feature.hasOwnProperty("strokeWidthModifier")) {
      scaleStrokeWidthAndChildren(
        childElement,
        // @ts-ignore
        1 / feature.strokeWidthModifier,
      );
    }

    if (info.hasOwnProperty("strokeColor")) {
      // @ts-ignore
      setStrokeColorAndChildren(childElement, info.strokeColor);
    }

    if (info.scaleFatness && info.positions[0] !== null) {
      // Scale individual feature relative to the edge of the head. If fatness is 1, then there are 47 pixels on each side. If fatness is 0, then there are 78 pixels on each side.
      const distance = (78 - 47) * (1 - face.fatness);
      // @ts-ignore
      translate(childElement, distance, 0, "left", "top");
    }

    if (info.name === "eye") {
      for (const granchildElement of childElement.children) {
        if (granchildElement.getAttribute("fill") === `$[eyeReflection${i}]`) {
          granchildElement.setAttribute("fill", "white");
          if (i === 1) {
            const parentTransform =
              childElement.getAttribute("transform") || "";
            const rotateRegex = /rotate\(([^)]+)\)/;
            const match = parentTransform.match(rotateRegex);
            const parentRotate = match ? match[0] : null;
            // @ts-ignore
            addTransform(granchildElement as SVGGraphicsElement, parentRotate);
          }
        } else if (
          granchildElement.getAttribute("fill") ===
          `$[eyeReflection${(i + 1) % 2}]`
        ) {
          granchildElement.setAttribute("fill", "none");
        }
      }
    }

    if (info.name === "earring") {
      translate(
        childElement as SVGGraphicsElement,
        0,
        +face.ear.size,
        "left",
        "top",
      );
    }
  }

  const childElement = getChildElement(svg, insertPosition) as SVGSVGElement;

  if (
    info.scaleFatness &&
    info.positions.length === 1 &&
    info.positions[0] === null
  ) {
    // @ts-ignore
    scaleCentered(childElement, fatScale(face.fatness), 1);
  }

  // Mostly just for glasses
  if (info.positions.length === 1 && info.shiftWithEyes) {
    // @ts-ignore
    addTransform(
      childElement as SVGGraphicsElement,
      `translate(0, ${-1 * face.eye.height})`,
    );
  }
};

export const display = (
  container: HTMLElement | string | null,
  face: FaceConfig,
  overrides?: Overrides,
): void => {
  override(face, overrides);

  const containerElement =
    typeof container === "string"
      ? document.getElementById(container)
      : container;
  if (!containerElement) {
    throw new Error("container not found");
  }
  containerElement.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("version", "1.2");
  svg.setAttribute("baseProfile", "tiny");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 400 600");
  svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

  svg.insertAdjacentHTML("beforeend", addWrapper("", "wrapper"));
  const insideSVG = svg.firstChild as SVGSVGElement;

  // Needs to be in the DOM here so getBBox will work
  containerElement.appendChild(svg);

  const faceLineStrokeColor = getSkinAccent(face.body.color);

  const featureInfos: FeatureInfo[] = [
    {
      name: "head",
      positions: [null], // Meaning it just gets placed into the SVG with no translation
      scaleFatness: true,
    },
    {
      name: "blemish",
      positions: [null],
    },
    {
      name: "eyeLine",
      positions: [null],
      opaqueLines: true,
      shiftWithEyes: true,
      strokeColor: faceLineStrokeColor,
    },
    {
      name: "smileLine",
      positions: [
        [150, 435],
        [250, 435],
      ],
      opaqueLines: true,
      strokeColor: faceLineStrokeColor,
    },
    {
      name: "miscLine",
      positions: [null],
      opaqueLines: true,
      strokeColor: faceLineStrokeColor,
    },
    {
      name: "eye",
      positions: [
        [140, 310],
        [260, 310],
      ],
      shiftWithEyes: true,
    },
    {
      name: "eyebrow",
      positions: [
        [140, 270],
        [260, 270],
      ],
      shiftWithEyes: true,
    },
    {
      name: "nose",
      positions: [[200, 370]],
    },
    {
      name: "facialHair",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "mouth",
      positions: [[200, 440]],
    },
    {
      name: "hair",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "glasses",
      positions: [null],
      scaleFatness: true,
      shiftWithEyes: true,
    },
    {
      name: "accessories",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "earring",
      positions: [
        [50, 360] as [number, number],
        [350, 360] as [number, number],
      ],
      scaleFatness: true,
      placeBeginning: true,
    },
    {
      name: "ear",
      positions: [
        [55, 325] as [number, number],
        [345, 325] as [number, number],
      ],
      scaleFatness: true,
      placeBeginning: true,
    },
    {
      name: "jersey",
      positions: [null],
      placeBeginning: true,
    },
    {
      name: "body",
      positions: [null],
      placeBeginning: true,
    },
    {
      name: "hairBg",
      positions: [null],
      scaleFatness: true,
      placeBeginning: true,
    },
  ];

  paper.setup(document.createElement("canvas"));
  let baseFace;

  for (const info of featureInfos) {
    const feature = face[info.name];
    if (!feature || !feature.id || feature.id === "none" || feature.id === "") {
      continue;
    }

    if (legacyNameMap[feature.id]) {
      feature.id = legacyNameMap[feature.id];
    }

    const metadata = svgsMetadata[info.name].find(
      (metadata) => metadata.name === feature.id,
    ) as SvgMetadata;

    drawFeature(insideSVG, face, info, feature, metadata);

    if (info.name == "head") {
      baseFace = paper.project.importSVG(insideSVG);
    }

    if (metadata?.clip) {
      clipToParent(insideSVG, baseFace.clone(), "beforeend");
    }

    // After we add hair (which is last feature on face), add outer stroke to wrap entire face
    if (info.name == "hair") {
      const outerStroke = getOuterStroke(insideSVG);
      insideSVG.insertAdjacentHTML(
        "beforeend",
        addWrapper(outerStroke, "outerStroke"),
      );
    }
  }

  if (face.height !== undefined) {
    scaleTopDown(insideSVG, heightScale(face.height));
  }
};
