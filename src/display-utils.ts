// @ts-ignore
import paper from "paper-jsdom";
import { FaceConfig } from "./types";
import {
  hexToHsl,
  rgbToHex,
  hslToRgb,
  rgbaToRgbaString,
  hexToRgb,
  adjustShade,
} from "./color-utils";

export const swapSiblings = (svg: SVGSVGElement) => {
  const shadowDOMElement = getChildElement(svg, "afterbegin") as SVGSVGElement;
  const previousSibling = shadowDOMElement.nextSibling as SVGSVGElement;
  if (previousSibling) {
    svg.insertBefore(shadowDOMElement, previousSibling.nextElementSibling);
  }
};

export const addFaceShadowToBody = (
  face: FaceConfig,
  insideSVG: SVGSVGElement,
  faceOuterStrokePath: paper.Path,
) => {
  const bodyGroup = getChildElement(insideSVG, "afterbegin");
  const bodySVG = paper.project.importSVG(bodyGroup);
  const bodyColor = face.body.color;
  const faceShadowPath = getShadowFromStroke(
    faceOuterStrokePath,
    bodyColor,
    // "black",
  );
  const faceShadowSVGString: string = paperPathToSVGString(faceShadowPath);
  insideSVG.insertAdjacentHTML(
    "afterbegin",
    addWrapper(faceShadowSVGString, "shadow"),
  );

  const shadowSvgElement = getChildElementByClass(
    insideSVG,
    "shadow",
  ) as SVGSVGElement;

  clipToParent(
    shadowSvgElement,
    bodySVG.clone(),
    insideSVG,
    "afterbegin",
    "faceShadow",
  );
  swapSiblings(insideSVG);
};

export const clipToParent = (
  childElement: SVGSVGElement,
  parentElement: paper.Path,
  fullSvg: SVGSVGElement,
  insertLocation: "afterbegin" | "beforeend",
  className: string,
) => {
  const clippedItem = paper.project.importSVG(childElement);
  childElement.remove();
  const baseShape = unitePaths(findPathItems(parentElement.clone()));

  const smallChildren = findPathItems(clippedItem);
  const childGroup = new paper.Group();
  for (const child of smallChildren) {
    // child.stroke = null;
    // child.strokeWidth = 0;

    const intersection = baseShape.intersect(child);

    intersection.fillColor = child.fillColor;
    intersection.stroke = child.stroke;
    intersection.strokeColor = child.strokeColor;
    intersection.strokeWidth = child.strokeWidth;
    intersection.opacity = child.opacity;

    childGroup.addChild(intersection);
  }

  const resultSVG = childGroup.exportSVG({ asString: true });
  fullSvg.insertAdjacentHTML(insertLocation, resultSVG);

  childGroup.remove();

  const newlyAddedElement = getChildElement(
    fullSvg,
    insertLocation,
  ) as SVGSVGElement;
  addClassToElement(newlyAddedElement, className);
};

export const findPathItems = (item: paper.Item): paper.PathItem[] => {
  let paths: paper.PathItem[] = [];

  if (item.children) {
    item.children.forEach((child: any) => {
      paths = paths.concat(findPathItems(child));
    });
  }
  if (item instanceof paper.PathItem) {
    item.miterLimit = 0;
    paths.push(item);
  }

  return paths;
};

export const unitePaths = (paths: paper.PathItem[]): paper.Path => {
  const unitedPath = paths.reduce(
    (result, path) => {
      if (result) {
        result = result.unite(path);
      } else {
        result = path;
        result.miterLimit = 0;
      }
      return result;
    },
    null as paper.PathItem | null,
  ) as paper.Path;

  return unitedPath;
};

export const getOuterStroke = (svgElement: SVGElement): paper.Path => {
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
  unitedPath.miterLimit = 1;

  // Remove the imported item and its children from the project
  importedItem.remove();

  return unitedPath;
};

export const paperPathToSVGString = (path: paper.Path): string => {
  const svg = path.exportSVG({ asString: true });
  path.remove();
  return svg;
};

export const getShadowFromStroke = (
  svgElement: paper.Path,
  bodyColor: string,
): paper.Path => {
  const shadowPath = svgElement.clone();
  shadowPath.strokeWidth = 0;
  shadowPath.fillColor = new paper.Color(getSkinAccent(bodyColor));
  shadowPath.opacity = 0.25;
  shadowPath.width *= 0.75;
  shadowPath.position.y += 10;
  return shadowPath;
};

export const getChildElement = (
  svg: SVGSVGElement,
  insertPosition: "afterbegin" | "beforeend",
) => {
  if (insertPosition === "afterbegin") {
    return svg.firstChild;
  } else {
    return svg.lastChild;
  }
};

export const getSkinAccent = (skinColor: string): string => {
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

export const getSkinShadow = (skinColor: string): string => {
  const skinColorRgba = rgbaToRgbaString(
    hexToRgb(getSkinAccent(skinColor)),
    0.3,
  );

  return skinColorRgba;
};

export const getHairAccent = (hairColor: string): string => {
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

export const getChildElementByClass = (
  parentElement: SVGSVGElement,
  className: string,
): SVGSVGElement | null => {
  for (const child of parentElement.children) {
    if (child.getAttribute("class") === className) {
      return child as SVGSVGElement;
    }
  }
  return null;
};

export const addClassToElement = (
  element: SVGGraphicsElement,
  className: string,
) => {
  const existingClass = element.getAttribute("class");
  const existingClassSet = new Set(existingClass?.split(" ") || []);
  existingClassSet.add(className);
  element.setAttribute("class", Array.from(existingClassSet).join(" "));
};

export const addWrapper = (svgString: string, objectTitle?: string) =>
  `<g class="${objectTitle}">${svgString}</g>`;
