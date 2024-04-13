export type Overrides = {
  [key: string]: boolean | string | number | any[] | Overrides;
};

export type TeamColors = [string, string, string];

export type Gender = "male" | "female";
export type GenderOptions = "male" | "female" | "both";

export type Feature =
  | "accessories"
  | "body"
  | "ear"
  | "eye"
  | "eyebrow"
  | "eyeLine"
  | "facialHair"
  | "glasses"
  | "hair"
  | "hairBg"
  | "head"
  | "jersey"
  | "miscLine"
  | "mouth"
  | "nose"
  | "smileLine"
  | "earring";

export type Race = "asian" | "black" | "brown" | "white";

export type FeatureInfo = {
  id?: string;
  name: Feature;
  positions: [null] | [number, number][];
  scaleFatness?: boolean;
  shiftWithEyes?: boolean;
  opaqueLines?: boolean;
};

// export type FaceConfigSections = Exclude<keyof FaceConfig, FaceConfigGlobalAttrs>;
export type FaceConfigGlobalAttrs = "fatness" | "teamColors";

export type FaceConfig = {
  fatness: number;
  height: number;
  teamColors: TeamColors;
  lineOpacity: number;
  eyeDistance: number;
  eyeHeight: number;
  hairBg: {
    id: string;
  };
  body: {
    id: string;
    color: string;
    size: number;
  };
  jersey: {
    id: string;
  };
  ear: {
    id: string;
    size: number;
  };
  head: {
    id: string;
    shaveOpacity: number;
  };
  eyeLine: {
    id: string;
  };
  smileLine: {
    id: string;
    size: number;
  };
  miscLine: {
    id: string;
  };
  facialHair: {
    id: string;
  };
  eye: {
    id: string;
    angle: number;
    color: string;
  };
  eyebrow: {
    id: string;
    angle: number;
  };
  hair: {
    id: string;
    color?: string;
    flip?: boolean;
  };
  mouth: {
    id: string;
    flip: boolean;
    size: number;
  };
  nose: {
    id: string;
    flip: boolean;
    size: number;
  };
  glasses: {
    id: string;
  };
  accessories: {
    id: string;
  };
  earring: {
    id: string;
  };
};

export type GenerateOptions = { gender?: Gender; race?: Race };

export type GallerySize = "sm" | "md" | "lg";

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
  setShuffleGenderSettingObject: (options: Gender[]) => void;
  setShuffleRaceSettingObject: (options: Race[]) => void;
};

export type GallerySectionConfig = {
  key: string;
  text: string;
  isSelected?: boolean;
  randomizeEnabled?: boolean;
  selectedValue?: number | string | boolean;
  hasSvgs?: boolean;
  noneAllowed?: boolean;
  selectionType?: "range" | "boolean" | "color" | "svgs";
  renderOptions?: {
    rangeConfig?: {
      min: number;
      max: number;
      step?: number;
      sliderStep?: number;
    };
    isColor?: boolean;
    colorCount?: number;
    isBoolean?: boolean;
    valuesToRender?: any[];
  };
};

export type CombinedState = FaceState & GalleryState;

export type OverrideListItem = {
  override: Overrides;
  display: string;
  value: string | number | boolean;
  ref?: any;
};

export type OverrideList = OverrideListItem[];
