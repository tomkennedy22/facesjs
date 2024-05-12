import { pickRandom, randomGaussian } from "../public/utils";
import { colors, jerseyColorOptions } from "./globals";
import override from "./override";
import { svgsGenders, svgsIndex } from "./svgs-index";
import {
  FaceConfig,
  Feature,
  Gender,
  Overrides,
  Race,
  TeamColors,
} from "./types";

function randomInt(
  minInclusive: number,
  max: number,
  inclusiveMax: boolean = false,
) {
  if (inclusiveMax) {
    max += 1;
  }
  return Math.floor(Math.random() * (max - minInclusive)) + minInclusive;
}

const getID = (type: Feature, gender: Gender): string => {
  const validIDs = svgsIndex[type].filter((_, index) => {
    return (
      svgsGenders[type][index] === "both" || svgsGenders[type][index] === gender
    );
  });

  return pickRandom(validIDs);
};

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const generate = (
  overrides?: Overrides,
  options?: { gender?: Gender; race?: Race },
): FaceConfig => {
  let playerRace: Race = (() => {
    if (options && options.race) {
      return options.race;
    }

    return pickRandom(["white", "asian", "brown", "black"]);
    // return pickRandom(["white"]);
  })();

  const gender = options && options.gender ? options.gender : "male";
  // let teamColors: TeamColors = pickRandom(jerseyColorOptions);
  let teamColors: TeamColors = pickRandom(jerseyColorOptions);

  const eyeAngle = randomInt(-10, 15, true);

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
      default:
        return colors.black;
    }
  })();
  const skinColor = pickRandom(palette.skin);
  const hairColor = pickRandom(palette.hair);
  const eyeColor = pickRandom(palette.eyes);
  const isFlipped = () => Math.random() < 0.5;

  const face: FaceConfig = {
    fatness: roundTwoDecimals((gender === "female" ? 0.4 : 1) * Math.random()),
    height: roundTwoDecimals(Math.random()),
    teamColors: teamColors,
    lineOpacity: roundTwoDecimals((0.25 + 0.5 * Math.random()) ** 2),
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
        0.5 + (gender === "female" ? 0.5 : 1) * Math.random(),
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
      size: roundTwoDecimals(0.85 + Math.random() * 0.3),
      distance: roundTwoDecimals(8 * Math.random() - 6),
      height: roundTwoDecimals(20 * Math.random() - 10),
    },
    eyebrow: {
      id: getID("eyebrow", gender),
      angle: randomInt(-15, 20, true),
    },
    hair: {
      id: getID("hair", gender),
      color: hairColor,
      flip: isFlipped(),
    },
    mouth: {
      id: getID("mouth", gender),
      flip: isFlipped(),
      size: roundTwoDecimals(0.6 + Math.random() * 0.6),
    },
    nose: {
      id: getID("nose", gender),
      flip: isFlipped(),
      size: roundTwoDecimals(
        0.5 + Math.random() * (gender === "female" ? 0.5 : 0.75),
      ),
      angle: randomGaussian(-3, 3),
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
