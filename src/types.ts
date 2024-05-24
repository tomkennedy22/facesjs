import type { generate } from "./generate";

export type Overrides = {
  [key: string]: boolean | string | number | any[] | Overrides;
};

export type Gender = "male" | "female";
export type GenderOption = Gender | "both";

export type Sport =
  | "basketball"
  | "baseball"
  | "football"
  | "hockey"
  | "suit"
  | "referee"
  | "all";

export type Feature =
  | "accessories"
  | "blemish"
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

export type TeamColors = [string, string, string];

export type FeatureInfo = {
  id?: string;
  name: Feature;
  positions: [null] | [number, number][];
  scaleFatness?: boolean;
  shiftWithEyes?: boolean;
  opaqueLines?: boolean;
  placeBeginning?: boolean;
  flip?: boolean;
  mirror?: boolean;
  size?: number;
  strokeWidthModifier?: number;
  strokeColor?: string;
};

export type FaceConfig = ReturnType<typeof generate>;

export type HSL = {
  h: number;
  s: number;
  l: number;
};

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type RGBA = RGB & { a: number };

export type HEX = string;

export type SvgMetadata = {
  name: string;
  gender: GenderOption;
  sport: Sport[] | Sport;
  occurance: number;
  clip: boolean;
  noAngle: boolean;
};
