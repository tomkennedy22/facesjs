import { colors, jerseyColorOptions } from "./globals.js";
import override from "./override.js";
import { svgsGenders, svgsIndex, svgsMetadata } from "./svgs-index.js";
import { Feature, Gender, Overrides, Race, TeamColors } from "./types.js";
import {
  pickRandom,
  randomGaussian,
  randomInt,
  weightedRandomChoice,
} from "./utils";

const getID = (type: Feature, gender: Gender): string => {
  const validIDs = svgsIndex[type].filter((_id, index) => {
    return (
      svgsGenders[type][index] === "both" || svgsGenders[type][index] === gender
    );
  });

  return validIDs[randomInt(0, validIDs.length)];
};

const getIDWithOccurance = (type: Feature, gender: Gender): string => {
  const validIDsWeightMap: [any, number][] = svgsIndex[type]
    .filter((_id, index) => {
      return (
        svgsMetadata[type][index].gender === "both" ||
        svgsGenders[type][index] === gender
      );
    })
    .map((_id, index) => {
      return [svgsIndex[type][index], svgsMetadata[type][index].occurance];
    });

  return weightedRandomChoice(validIDsWeightMap);
};

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const generate = (
  overrides?: Overrides,
  options?: { gender?: Gender; race?: Race },
) => {
  const playerRace: Race = (() => {
    if (options && options.race) {
      return options.race;
    }
    switch (randomInt(0, 4)) {
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
    }
  })();

  const skinColor = pickRandom(palette.skin);
  const hairColor = pickRandom(palette.hair);
  const eyeColor = pickRandom(palette.eyes);
  const isFlipped = () => Math.random() < 0.5;

  const face = {
    fatness: roundTwoDecimals((gender === "female" ? 0.4 : 1) * Math.random()),
    height: roundTwoDecimals(
      gender === "female" ? 0.65 * Math.random() : 0.4 + 0.6 * Math.random(),
    ),
    teamColors: teamColors,
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
      id: getID("eyeLine", gender),
      opacity:
        Math.random() < 0.75 ? roundTwoDecimals(0.6 + 0.4 * Math.random()) : 0,
      strokeWidthModifier: roundTwoDecimals(1 + Math.random()),
    },
    smileLine: {
      id: getID("smileLine", gender),
      size: roundTwoDecimals(0.25 + 2 * Math.random()),
      opacity: roundTwoDecimals(
        Math.random() < (gender === "male" ? 0.75 : 0.1)
          ? 0
          : 0.6 + 0.4 * Math.random(),
      ),
      strokeWidthModifier: roundTwoDecimals(1 + 0.5 * Math.random()),
    },
    miscLine: {
      id: getID("miscLine", gender),
      opacity: roundTwoDecimals(
        Math.random() < 0.5 ? 0 : 0.6 + 0.4 * Math.random(),
      ),
      strokeWidthModifier: roundTwoDecimals(1 + Math.random()),
    },
    facialHair: {
      id: Math.random() < 0.5 ? getID("facialHair", gender) : "none",
    },
    eye: {
      id: getID("eye", gender),
      angle: eyeAngle,
      color: eyeColor,
      size: roundTwoDecimals(0.9 + Math.random() * 0.2),
      distance: roundTwoDecimals(8 * Math.random() - 6),
      height: roundTwoDecimals(20 * Math.random() - 10),
    },
    eyebrow: {
      id: getID("eyebrow", gender),
      angle: randomInt(-15, 20, true),
    },
    hair: {
      id: getIDWithOccurance("hair", gender),
      color: hairColor,
      flip: isFlipped(),
    },
    mouth: {
      id: getID("mouth", gender),
      flip: isFlipped(),
      size: roundTwoDecimals(0.8 + Math.random() * 0.4),
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
