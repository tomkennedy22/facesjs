import { colors } from "./globals";
import override from "./override";
import { svgsGenders, svgsIndex } from "./svgs-index";
import { FaceConfig, Feature, Gender, Overrides, Race, TeamColors } from "./types";

// const colorHexToRGB = (
//     hairColor: string | undefined
// ): { hairR: number; hairG: number; hairB: number } => {
//     if (!hairColor) return { hairR: 0, hairG: 0, hairB: 0 }
//     const hex = hairColor.replace("#", "");
//     const r = parseInt(hex.substring(0, 2), 16);
//     const g = parseInt(hex.substring(2, 4), 16);
//     const b = parseInt(hex.substring(4, 6), 16);

//     return { hairR: r, hairG: g, hairB: b };
// };

const getID = (type: Feature, gender: Gender): string => {

    if (!svgsIndex[type]) {
        return 'none';
    }

    const validIDs = svgsIndex[type]!.filter((_, index) => {
        return (
            svgsGenders[type]![index] === "both" || svgsGenders[type]![index] === gender
        );
    });

    return validIDs[Math.floor(Math.random() * validIDs.length)] || 'none';
};



const defaultTeamColors: TeamColors = ["#89bfd3", "#7a1319", "#07364f"];

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const generate = (
    overrides?: Overrides,
    options?: { gender?: Gender; race?: Race },
): FaceConfig => {
    const playerRace: Race = (() => {
        if (options && options.race) {
            return options.race;
        }
        switch (Math.floor((Math.random() ** 100) * 4)) {
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


    // const gender = options && options.gender ? options.gender : "male";
    const gender = Math.random() < 0.999 ? "male" : "female"

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
            default:
                return colors.black
        }
    })();
    const skinColor: string =
        palette.skin[Math.floor((Math.random() ** 100) * palette.skin.length)] as string;
    const hairColor = '#B55239';
    //palette.hair[Math.floor(Math.random() * palette.hair.length)];
    const isFlipped: boolean = Math.random() < 0.5;

    // const { hairR, hairG, hairB } = colorHexToRGB(hairColor);

    const face: FaceConfig = {
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
            // TODO CHANGE BACK TO 0.5
            id: Math.random() < 0.999 ? getID("facialHair", gender) : "none",
        },
        eye: {
            id: getID("eye", gender),
            angle: eyeAngle,
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
                0.5 + Math.random() * (gender === "female" ? 0.5 : 0.75),
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
