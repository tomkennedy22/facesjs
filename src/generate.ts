import { colors, jerseyColorOptions } from "./globals.js";
import override from "./override.js";
import { svgsMetadata } from "./svgs-index.js";
import {
  Feature,
  Gender,
  Overrides,
  Race,
  Sport,
  TeamColors,
} from "./types.js";
import {
  pickRandom,
  randomGaussian,
  randomInt,
  weightedRandomChoice,
} from "./utils";

const getID = (
  type: Feature,
  useOccurance?: boolean,
  filters?: { gender?: Gender; sport?: Sport },
): string => {
  const validIDsWeightMap: [string, number][] = svgsMetadata[type]
    .filter((svgMetadata) => {
      const isMatch =
        !filters ||
        ((!filters.sport ||
          svgMetadata.sport === "all" ||
          svgMetadata.sport === filters.sport ||
          (Array.isArray(svgMetadata.sport) &&
            svgMetadata.sport.includes(filters.sport))) &&
          (!filters.gender ||
            svgMetadata.gender === "both" ||
            svgMetadata.gender === filters.gender));

      return isMatch;
    })
    .map((metadata) => {
      return [metadata.name, useOccurance ? metadata.occurance : 1];
    });

  const chosenID = weightedRandomChoice(validIDsWeightMap);
  return chosenID;
};

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const generate = (
  overrides?: Overrides,
  options?: { gender?: Gender; race?: Race; sport?: Sport },
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

  const sport: Sport =
    options && options.sport
      ? options.sport
      : pickRandom([
          "basketball",
          "football",
          "hockey",
          "baseball",
          "suit",
          "referee",
        ]);
  const gender = options && options.gender ? options.gender : "male";

  const teamColors: TeamColors = pickRandom(jerseyColorOptions);
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
          ? getID("hairBg", false, { gender })
          : "none",
    },
    blemish: {
      id: getID("blemish", true, { gender }),
      // mirror: isFlipped(),
      // flip: isFlipped(),
      // angle: randomInt(-90, 90, true),
    },
    body: {
      id: getID("body", false, { gender }),
      color: skinColor,
      size: gender === "female" ? 0.95 : 1,
    },
    jersey: {
      id: getID("jersey", false, { gender, sport }),
    },
    ear: {
      id: getID("ear", false, { gender }),
      size: roundTwoDecimals(
        0.5 + (gender === "female" ? 0.5 : 1) * Math.random(),
      ),
    },
    earring: {
      id:
        (gender === "female" ? 1 : 0.1) * Math.random() > 0.25
          ? getID("earring", false, { gender })
          : "none",
    },
    head: {
      id: getID("head", false, { gender }),
      shaveOpacity:
        gender === "male" && Math.random() < 0.35
          ? roundTwoDecimals(Math.random() / 5)
          : 0,
    },
    eyeLine: {
      id: getID("eyeLine", false, { gender }),
      opacity:
        Math.random() < 0.75 ? roundTwoDecimals(0.6 + 0.4 * Math.random()) : 0,
      strokeWidthModifier: roundTwoDecimals(1 + Math.random()),
    },
    smileLine: {
      id: getID("smileLine", false, { gender }),
      size: roundTwoDecimals(0.25 + 2 * Math.random()),
      opacity: roundTwoDecimals(
        Math.random() < (gender === "male" ? 0.75 : 0.1)
          ? 0
          : 0.6 + 0.4 * Math.random(),
      ),
      strokeWidthModifier: roundTwoDecimals(1 + 0.5 * Math.random()),
    },
    miscLine: {
      id: getID("miscLine", false, { gender }),
      opacity: roundTwoDecimals(
        Math.random() < 0.5 ? 0 : 0.6 + 0.4 * Math.random(),
      ),
      strokeWidthModifier: roundTwoDecimals(1 + Math.random()),
    },
    facialHair: {
      id: Math.random() < 0.5 ? getID("facialHair", false, { gender }) : "none",
    },
    eye: {
      id: getID("eye", false, { gender }),
      angle: eyeAngle,
      color: eyeColor,
      size: roundTwoDecimals(0.9 + Math.random() * 0.2),
      distance: roundTwoDecimals(8 * Math.random() - 6),
      height: roundTwoDecimals(20 * Math.random() - 10),
    },
    eyebrow: {
      id: getID("eyebrow", false, { gender }),
      angle: randomInt(-15, 20, true),
    },
    hair: {
      id: getID("hair", true, { gender }),
      color: hairColor,
      flip: isFlipped(),
    },
    mouth: {
      id: getID("mouth", false, { gender }),
      flip: isFlipped(),
      size: roundTwoDecimals(0.8 + Math.random() * 0.4),
    },
    nose: {
      id: getID("nose", false, { gender }),
      flip: isFlipped(),
      size: roundTwoDecimals(
        0.5 + Math.random() * (gender === "female" ? 0.5 : 0.75),
      ),
      angle: randomGaussian(-3, 3),
    },
    glasses: {
      id:
        Math.random() < 0.1
          ? getID("glasses", false, { gender, sport })
          : "none",
    },
    accessories: {
      id:
        Math.random() < 20.2
          ? getID("accessories", false, { gender, sport })
          : "none",
    },
  };

  override(face, overrides);

  return face;
};
