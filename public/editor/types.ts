import { FaceConfig, Gender, Overrides, Race, Sport } from "../../src";

export type GallerySize = "sm" | "md" | "lg";
export type ColorFormat = "hex" | "rgba";

export type FaceState = {
  faceConfig: FaceConfig;
  setFaceStore: (newFace: FaceConfig) => void;
};

export type GalleryState = {
  gallerySize: GallerySize;
  gallerySectionConfigList: GallerySectionConfig[];
  setGallerySize: (size: GallerySize) => void;
  lastClickedSectionIndex: number;
  setLastClickedSectionIndex: (index: number) => void;
  lastSelectedFaceIndex: number;
  setLastSelectedFaceIndex: (index: number) => void;
  setRandomizeEnabledForSection: (
    sectionIndex: number,
    enabled: boolean,
  ) => void;

  shuffleGenderSettingObject: Gender[];
  shuffleRaceSettingObject: Race[];
  shuffleSportSettingObject: Sport[];
  setShuffleGenderSettingObject: (options: Gender[]) => void;
  setShuffleRaceSettingObject: (options: Race[]) => void;
  setShuffleSportSettingObject: (options: Sport[]) => void;
};

type GallerySectionConfigBase = {
  key: string;
  text: string;
  isSelected?: boolean;
  randomizeEnabled: boolean;
};

type GallerySectionConfigRange = GallerySectionConfigBase & {
  selectionType: "range";
  selectedValue: number;
  renderOptions: {
    rangeConfig: {
      min: number;
      max: number;
      step: number;
      sliderStep: number;
    };
    valuesToRender: number[];
  };
};

type GallerySectionConfigColor = GallerySectionConfigBase & {
  selectionType: "color";
  selectedValue: string;
  colorFormat: ColorFormat;
  renderOptions: {
    valuesToRender: string[];
  };
};

type GallerySectionConfigColors = GallerySectionConfigBase & {
  selectionType: "colors";
  selectedValue: string[];
  colorFormat: ColorFormat;
  renderOptions: {
    colorCount: number;
    valuesToRender: string[][];
  };
};

type GallerySectionConfigSvgs = GallerySectionConfigBase & {
  selectionType: "svgs";
  selectedValue: string;
  flip?: {
    key: string;
    selectedValue: boolean;
  };
  mirror?: {
    key: string;
    selectedValue: boolean;
  };
};

export type GallerySectionConfig =
  | GallerySectionConfigRange
  | GallerySectionConfigColor
  | GallerySectionConfigColors
  | GallerySectionConfigSvgs;

export type CombinedState = FaceState & GalleryState;

export type OverrideListItem = {
  override: Overrides;
  value: string | number | string[];
};
