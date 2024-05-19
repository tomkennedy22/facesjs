import override from "../../src/override";
import { svgsMetadata } from "../../src/svgs-index";
import { FaceConfig, Overrides, SvgMetadata } from "../../src/types";
import { GallerySectionConfig, OverrideListItem } from "./types";
import { deepCopy, doesStrLookLikeColor, luma, setToDict } from "./utils";

export const getOverrideListForItem = (
  gallerySectionConfig: GallerySectionConfig,
) => {
  const overrideList: OverrideListItem[] = [];

  if (gallerySectionConfig.selectionType === "svgs") {
    if (gallerySectionConfig.key.includes("id")) {
      const featureName = gallerySectionConfig.key.split(".")[0];

      const featureSvgMetadata = [
        ...(svgsMetadata as Record<string, SvgMetadata[]>)[featureName],
      ];
      featureSvgMetadata.sort((a, b) => {
        if (a.name === "none" || a.name === "bald") return -1;
        if (b.name === "none" || b.name === "bald") return 1;

        if (doesStrLookLikeColor(a.name) && doesStrLookLikeColor(b.name)) {
          return luma(a.name) - luma(b.name);
        }

        const regex = /^([a-zA-Z-]+)(\d*)$/;
        const matchA = a.name.match(regex);
        const matchB = b.name.match(regex);

        const textA = matchA ? matchA[1] : a.name,
          numA = matchA ? matchA[2] : "";
        const textB = matchB ? matchB[1] : b.name,
          numB = matchB ? matchB[2] : "";

        if (textA < textB) return -1;
        if (textA > textB) return 1;

        if (numA && numB) {
          return parseInt(numA, 10) - parseInt(numB, 10);
        }

        if (numA) return 1;
        if (numB) return -1;

        return 0;
      });

      for (const svgMetadata of featureSvgMetadata) {
        const overrides: Overrides = {
          [featureName]: { id: svgMetadata.name },
        };
        overrideList.push({
          override: overrides,
          value: svgMetadata.name,
        });
      }
    }
  } else if (
    gallerySectionConfig.selectionType === "range" ||
    gallerySectionConfig.selectionType === "color" ||
    gallerySectionConfig.selectionType === "colors"
  ) {
    for (
      let i = 0;
      i < gallerySectionConfig.renderOptions.valuesToRender.length;
      i++
    ) {
      const valueToRender =
        gallerySectionConfig.renderOptions.valuesToRender[i];
      const overrides: Overrides = setToDict(
        {},
        gallerySectionConfig.key,
        valueToRender,
      ) as Overrides;
      overrideList.push({
        override: overrides,
        value: valueToRender,
      });
    }
  }

  return overrideList;
};

export const newFaceConfigFromOverride = (
  faceConfig: FaceConfig,
  key: string,
  chosenValue: unknown,
) => {
  const faceConfigCopy = deepCopy(faceConfig);
  const newOverride: Overrides = setToDict({}, key, chosenValue) as Overrides;
  override(faceConfigCopy, newOverride);
  return faceConfigCopy;
};
