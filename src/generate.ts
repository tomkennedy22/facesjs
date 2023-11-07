import override, { Overrides } from "./override.js";
import { svgsGenders, svgsIndex } from "./svgs-index.js";

type Gender = "male" | "female";

type Feature =
  | "accessories"
  | "body"
  | "ear"
  | "earring"
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
  | "smileLine";

const colorHexToRGB = (
  hairColor: string
): { hairR: number; hairG: number; hairB: number } => {
  const hex = hairColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { hairR: r, hairG: g, hairB: b };
};

const getID = (type: Feature, gender: Gender): string => {
  const validIDs = svgsIndex[type].filter((id, index) => {
    return (
      svgsGenders[type][index] === "both" || svgsGenders[type][index] === gender
    );
  });

  return validIDs[Math.floor(Math.random() * validIDs.length)];
};

type Race = "asian" | "black" | "brown" | "white";

const colors = {
  white: {
    skin: ["#f2d6cb", "#ddb7a0"],
    hair: [
      "#272421",
      "#3D2314",
      "#5A3825",
      "#CC9966",
      "#2C1608",
      "#B55239",
      "#e9c67b",
      "#D7BF91",
    ],
    eyes: [
      "#739ac5",
      "#6d8aa8",
      "#7b9eb4",
      "#56738f",
      "#728c62",
      "#5d4037",
      "#6d4c41",
      "#7e5e52",
      "#a7856a",
      "#9c7f64",
      "#6e511e",
      "#9da4ad",
      "#3a282a",
      "#312923",
      "#2c2a29",
    ],
  },
  asian: {
    // https://imgur.com/a/GrBuWYw
    skin: ["#fedac7", "#f0c5a3", "#eab687"],
    hair: ["#272421", "#0f0902"],
    eyes: ["#3a282a", "#312923", "#2c2a29", "#6d4c41", "#795548"],
  },
  brown: {
    skin: ["#bb876f", "#aa816f", "#a67358"],
    hair: ["#272421", "#1c1008"],
    eyes: ["#3a282a", "#312923", "#2c2a29"],
  },
  black: {
    skin: ["#ad6453", "#74453d", "#5c3937"],
    hair: ["#272421"],
    eyes: ["#3a282a", "#312923", "#2c2a29"],
  },
};

const defaultTeamColors = ["#89bfd3", "#7a1319", "#07364f"];

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const generate = (
  overrides?: Overrides,
  options?: { gender?: Gender; race?: Race }
) => {
  const playerRace: Race = (() => {
    if (options && options.race) {
      return options.race;
    }
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        return "white";
      case 1:
        return "asian";
      case 2:
        return "brown";
      default:
        return "black";
    }
  })();

  const gender = options && options.gender ? options.gender : "male";

  const eyeAngle = Math.round(Math.random() * 25 - 10);

  const palette = (() => {
    switch (playerRace) {
      case "white":
        return colors.white;
      case "asian":
        return colors.asian;
      case "brown":
        return colors.brown;
      case "black":
        return colors.black;
    }
  })();
  const skinColor =
    palette.skin[Math.floor(Math.random() * palette.skin.length)];
  const hairColor =
    palette.hair[Math.floor(Math.random() * palette.hair.length)];
  const eyeColor =
    palette.eyes[Math.floor(Math.random() * palette.eyes.length)];
  const isFlipped = Math.random() < 0.5;

  const { hairR, hairG, hairB } = colorHexToRGB(hairColor);

  const face = {
    fatness: roundTwoDecimals((gender === "female" ? 0.4 : 1) * Math.random()),
    lineOpacity: roundTwoDecimals((0.25 + 0.5 * Math.random()) ** 2),
    teamColors: defaultTeamColors,
    eyeDistance: 8 * Math.random() - 4,
    hairBg: {
      id:
        Math.random() < (gender === "male" ? 0.1 : 0.9)
          ? getID("hairBg", gender)
          : "none",
    },
    body: {
      id: getID("body", gender),
      color: skinColor,
      size: gender === "female" ? 0.95 : 1,
    },
    jersey: {
      id: getID("jersey", gender),
    },
    ear: {
      id: getID("ear", gender),
      size: roundTwoDecimals(
        0.5 + (gender === "female" ? 0.5 : 1) * Math.random()
      ),
    },
    earring: {
      id:
        (gender === "female" ? 1 : 0.5) * Math.random() > 0.25
          ? getID("earring", gender)
          : "none",
    },
    head: {
      id: getID("head", gender),
      shaveOpacity:
        gender === "male" && Math.random() < 0.35
          ? roundTwoDecimals(Math.random() / 5)
          : 0,
    },
    eyeLine: {
      id: Math.random() < 0.75 ? getID("eyeLine", gender) : "none",
    },
    smileLine: {
      id:
        Math.random() < (gender === "male" ? 0.75 : 0.1)
          ? getID("smileLine", gender)
          : "none",
      size: roundTwoDecimals(0.25 + 2 * Math.random()),
    },
    miscLine: {
      id: Math.random() < 0.5 ? getID("miscLine", gender) : "none",
    },
    facialHair: {
      id: Math.random() < 0.5 ? getID("facialHair", gender) : "none",
    },
    eye: {
      id: getID("eye", gender),
      angle: eyeAngle,
      color: eyeColor,
    },
    eyebrow: {
      id: getID("eyebrow", gender),
      angle: Math.round(Math.random() * 35 - 15),
    },
    hair: {
      id: getID("hair", gender),
      color: hairColor,
      flip: isFlipped,
    },
    mouth: {
      id: getID("mouth", gender),
      flip: isFlipped,
      size: roundTwoDecimals(0.6 + Math.random() * 0.6),
    },
    nose: {
      id: getID("nose", gender),
      flip: isFlipped,
      size: roundTwoDecimals(
        0.5 + Math.random() * (gender === "female" ? 0.5 : 0.75)
      ),
    },
    glasses: {
      id: Math.random() < 0.1 ? getID("glasses", gender) : "none",
    },
    accessories: {
      id: Math.random() < 0.2 ? getID("accessories", gender) : "none",
    },
  };

  override(face, overrides);

  return face;
};

export type Face = ReturnType<typeof generate>;
