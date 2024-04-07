import override from "./override";
import svgs from "./svgs";
import { FaceConfig, Feature, FeatureInfo, Overrides } from "./types";
// @ts-ignore
import paper from 'paper-jsdom';
import { get_from_dict } from "./utils";


const ConfiglessFeatures = ["faceStroke"];
function combineSVGStrings(elementArr: string[]): string | null {
  paper.setup(new paper.Size(400, 600));

  if (elementArr.length === 0) {
    return null;
  }

  // Assuming createPaperPathFromSVG returns a paper.Item,
  // we filter out any non-path items for safety.
  let pathItems: (paper.Path | paper.CompoundPath)[] = elementArr.map(createPaperPathFromSVG).filter((item): item is paper.Path | paper.CompoundPath => item instanceof paper.Path || item instanceof paper.CompoundPath);
  if (pathItems.length === 0) {
    return null; // Return an empty string if there are no valid path items.
  }

  // @ts-ignore
  let combinedPath: paper.Path | paper.CompoundPath = pathItems[0];
  for (let i = 1; i < pathItems.length; i++) {
    // @ts-ignore
    combinedPath = combinedPath.unite(pathItems[i]);
  }

  // const svgElement = combinedPath.exportSVG(); // Get SVG DOM element
  const svgString = combinedPath.pathData; // Get SVG string

  return `<path fill="none" stroke-width="6" stroke="black" d="${svgString}"></path>` as string;
}

const combineSVGElements = (parentElement: SVGSVGElement): SVGGraphicsElement | null => {

  // @ts-ignore
  console.log('Starting combineSVGElements', { parentElement, xml: parentElement.toXml() })
  paper.setup(new paper.Size(400, 600));
  // @ts-ignore
  paper.project.importSVG(parentElement.toXml()
    // , {
    //   onLoad: function (item: any) {
    //     console.log('combineSVGElements onLoad', { item })
    //     // Assuming `item` contains the imported SVG with its structure
    //     let unifiedPath = new paper.Path();

    //     // Iterate over all children if the imported SVG is a group
    //     item.children.forEach((child: any) => {
    //       // This example assumes all children are paths or compound paths.
    //       // In practice, you might need a recursive function to handle nested groups.
    //       unifiedPath = unifiedPath.unite(child.toPath());
    //     });

    //     console.log('combineSVGElements unifiedPath', { unifiedPath, item })

    //     // Apply a stroke to the unified path
    //     unifiedPath.strokeColor = 'black';
    //     unifiedPath.strokeWidth = 2;

    //     // If you need to perform operations with the unified path or export it
    //     console.log(unifiedPath.exportSVG({ asString: true }));

    //     // Remove original item to leave only the unified stroke path
    //     item.remove();
    //   }
    // });

  );

  console.log('combineSVGElements', { parentElement, paper, project: paper.project })

  return null
}

const replacements: { [key: string]: string } = {
  skinColor: '#ffffff', // Example skin color
  hairColor: '#000000', // Example hair color
  shaveOpacity: '0.5', // Example opacity
};

const replaceSVGPlaceholders = (svgString: string, replacements: { [key: string]: string }) => {
  let processedSVG = svgString;
  Object.keys(replacements).forEach(key => {
    const placeholder = `\\$\\[${key}\\]`; // Escaping $, [, and ]
    processedSVG = processedSVG.replace(new RegExp(placeholder, 'g'), replacements[key] || '');
  });
  return processedSVG;
}

const createPaperPathFromSVG = (svgString: string): paper.Path | paper.CompoundPath => {
  const replacedSVG = replaceSVGPlaceholders(svgString, replacements);

  // Initialize Paper.js
  paper.setup(document.createElement('canvas')); // Setup with a new canvas element

  // Use a regex to extract path data. This is a simple extraction method.
  const pathRegex = /<path[^>]+d="([^"]+)"[^>]*>/g;
  let match: RegExpExecArray | null;
  let paths: paper.Path[] = [];

  while ((match = pathRegex.exec(replacedSVG)) !== null) {
    if (match[1] !== undefined) {
      const pathData = match[1];
      paths.push(new paper.Path(pathData));
    }
  }

  // If only one path, return it directly; otherwise, create and return a CompoundPath
  // @ts-ignore
  if (paths.length === 1 && paths[0] && ((paths[0] instanceof paper.Path) || (paths[0] instanceof paper.CompoundPath))) {
    return paths[0];
  } else {
    // For multiple paths, construct a CompoundPath
    return new paper.CompoundPath({
      children: paths,
    });
  }
}


const addWrapper = (svgString: string) => `<g>${svgString}</g>`;

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
    scaleStrokeWidthAndChildren(children[i] as SVGGraphicsElement, factor);
  }
};

// Scale relative to the center of bounding box of element e, like in Raphael.
// Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
const scaleCentered = (element: SVGGraphicsElement, x: number, y: number) => {
  console.log('scaleCentered', { element, x, y })
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

const drawConfiglessFeature = (svg: SVGSVGElement, face: FaceConfig, info: FeatureInfo): SVGSVGElement | null => {

  // let svgsToCombine: (string | null | undefined)[] = info.featuresToCombine!.map((featureName: Feature) => {
  //   // @ts-ignore
  //   const feature = face[featureName];
  //   if (!feature || !svgs[featureName]) {
  //     return null;
  //   }
  //   // @ts-ignore
  //   return svgs[featureName][feature.id];
  // })

  // let svgsStrToCombine: string[] = svgsToCombine.filter((svg: (string | null | undefined)) => svg) as string[];

  let combinedSVG: SVGSVGElement = combineSVGElements(svg) as SVGSVGElement

  if (!combinedSVG) {
    return null;
  }
  return combinedSVG;
}

const drawFeature = (svg: SVGSVGElement, face: FaceConfig, info: FeatureInfo) => {

  // @ts-ignore
  let feature = face[info.name];

  if ((!feature || !svgs[info.name])) {
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

  // @ts-ignore
  let featureSVGString: string | null = svgs[info.name][feature.id]

  if (!featureSVGString) {
    return;
  }


  if (featureSVGString.includes("shaveOpacity")) {
    // @ts-ignore
    if (feature.shaveOpacity) {
      // @ts-ignore
      featureSVGString = featureSVGString.replace(
        /\$\[shaveOpacity\]/g,
        // @ts-ignore
        feature.shaveOpacity
      );
    }
    else {
      // @ts-ignore
      featureSVGString = featureSVGString.replace(
        /\$\[shaveOpacity\]/g,
        "0"
      );
    }
  }

  // @ts-ignore
  if (feature.shave) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace("$[faceShave]", feature.shave);
  }

  // @ts-ignore
  if (feature.shave) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace("$[headShave]", feature.shave);
  }

  featureSVGString = featureSVGString.replace("$[skinColor]", face.body.color);
  featureSVGString = featureSVGString.replace(
    /\$\[hairColor\]/g,
    face.hair.color || 'black',
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

  const bodySize = face.body.size !== undefined ? face.body.size : 1;
  let insertPosition: "beforebegin" | "beforeend" = info.placeBeginning ? "beforebegin" : "beforeend";
  let whichChild: 'firstChild' | 'lastChild' = insertPosition == "beforebegin" ? 'firstChild' : 'lastChild';

  const calcChildElement = () => {
    if (insertPosition === "beforebegin") {
      return svg.firstChild;
    } else {
      return svg.lastChild;
    }
  }

  let childElement = calcChildElement() as SVGSVGElement

  for (let i = 0; i < info.positions.length; i++) {
    svg.insertAdjacentHTML(insertPosition, addWrapper(featureSVGString));
    childElement = calcChildElement() as SVGSVGElement;

    console.log('Test whichchild', { t: childElement, svg, whichChild, insertPosition, feature, featureSVGString, i, info })

    const position = info.positions[i];

    if (position) {
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
        let move_direction = i == 1 ? 1 : -1;
        // @ts-ignore
        position[0] += move_direction * feature.distance;
      }

      let shiftDirection = i == 1 ? 1 : -1;
      if (info.shiftWithEyes) {
        // @ts-ignore
        position[0] += shiftDirection * face.eyeDistance;
      }

      translate(
        childElement as SVGGraphicsElement,
        position[0],
        position[1],
        xAlign,
      );
    }

    if (feature.hasOwnProperty("angle")) {
      // @ts-ignore
      rotateCentered(childElement, (i === 0 ? 1 : -1) * feature.angle);
    }

    // Flip if feature.flip is specified or if this is the second position (for eyes and eyebrows). Scale if feature.size is specified.
    // @ts-ignore
    const scale = feature.hasOwnProperty("size") ? feature.size : 1;
    if (info.name === "body" || info.name === "jersey") {
      // @ts-ignore
      scaleCentered(childElement, bodySize, 1);
      // @ts-ignore
    } else if (feature.flip || i === 1) {
      // @ts-ignore
      scaleCentered(childElement, -scale, scale);
    } else if (scale !== 1) {
      // @ts-ignore
      scaleCentered(childElement, scale, scale);
    }

    if (info.opaqueLines) {
      // @ts-ignore
      childElement.setAttribute("stroke-opacity", String(face.lineOpacity));
    }

    if (info.scaleFatness && info.positions[0] !== null) {
      // Scale individual feature relative to the edge of the head. If fatness is 1, then there are 47 pixels on each side. If fatness is 0, then there are 78 pixels on each side.
      const distance = (78 - 47) * (1 - face.fatness);
      // @ts-ignore
      translate(childElement, distance, 0, "left", "top");
    }
  }

  if (
    info.scaleFatness &&
    info.positions.length === 1 &&
    info.positions[0] === null
  ) {
    // @ts-ignore
    scaleCentered(childElement, fatScale(face.fatness), 1);
  }

  if (info.drawStrokeAfter) {
    // @ts-ignore
    childElement.setAttribute("stroke-width", "12");
    childElement.setAttribute("stroke", "black");
    svg.setAttribute("stroke", "black");
    svg.setAttribute("outer-stroke", "12");
  }
};

export const display = (
  container: HTMLElement | string | null,
  face: FaceConfig,
  overrides?: Overrides,
): void => {

  let startTime = new Date().getTime();

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

  // Needs to be in the DOM here so getBBox will work
  containerElement.appendChild(svg);

  const featureInfos: FeatureInfo[] = [
    {
      name: "head",
      positions: [null], // Meaning it just gets placed into the SVG with no translation
      scaleFatness: true,
    },
    {
      name: "eyeLine",
      positions: [null],
      opaqueLines: true,
    },
    {
      name: "smileLine",
      positions: [
        [150, 435],
        [250, 435],
      ],
      opaqueLines: true,
    },
    {
      name: "miscLine",
      positions: [null],
      opaqueLines: true,
    },
    {
      name: "facialHair",
      positions: [null],
      scaleFatness: true,
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
      name: "mouth",
      positions: [[200, 440]],
    },
    {
      name: "nose",
      positions: [[200, 370]],
    },
    {
      name: "hair",
      positions: [null],
      scaleFatness: true,
      drawStrokeAfter: true,
    },
    {
      name: "glasses",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "accessories",
      positions: [null],
      scaleFatness: true,
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
      name: "hairBg",
      positions: [null],
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
  ];

  for (const info of featureInfos) {
    drawFeature(svg, face, info);
  }

  let endTime = new Date().getTime();
  console.log(`Display time: ${endTime - startTime}ms`);
};