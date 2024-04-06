import * as fs from 'fs/promises';
import * as path from 'path';
import { optimize } from 'svgo';
import genders from './genders';
import { Feature } from './types';

const warning = "// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See utils/processSVGs.ts\n";

const processSVGs = async () => {
    const svgFolder = path.join(__dirname, '..', '..', '..', '..', 'svgs');
    const folders = await fs.readdir(svgFolder);
    const svgs: { [key: string]: any } = {};

    for (const folder of folders) {
        if (folder === ".DS_Store") continue;
        svgs[folder] = {};

        const subfolder = path.join(svgFolder, folder);
        const files = await fs.readdir(subfolder);
        for (const file of files) {
            if (!file.endsWith(".svg")) continue;
            const key = path.basename(file, ".svg");
            const contents = await fs.readFile(path.join(subfolder, file), "utf8");
            const result = await optimize(contents, { multipass: true, plugins: ["preset-default", "inlineStyles"] });

            svgs[folder][key] = result.data.replace(/.*<svg.*?>/, "").replace("</svg>", "");
        }
    }

    let svgFilePath = path.join(__dirname, 'svgs.ts');
    await fs.writeFile(svgFilePath, `${warning}\nimport { Feature } from "./types";\n\nconst svgs: {[key in Feature]?: {[key:string]: string}} = ${JSON.stringify(svgs)};\n\n export default svgs;`);
    console.log(`Wrote new file for svgs.ts at ${svgFilePath} at time ${new Date().toISOString()}`);

    const svgsIndex: { [key in Feature]?: string[] } = Object.keys(svgs).reduce((acc, key) => ({
        ...acc,
        [key]: Object.keys(svgs[key])
    }), {});

    const svgsGenders = Object.keys(svgsIndex).reduce((acc, key) => {
        let faceSection = key as Feature;
        let sectionOptions = svgsIndex[faceSection] as string[];
        const keyGenders = sectionOptions.map((featureName: any) => genders[faceSection]?.[featureName] || 'female');
        return { ...acc, [faceSection]: keyGenders };
    }, {});

    console.log('hello? tommy 3')
    let svgIndexFilePath = path.join(__dirname, 'svgs-index.ts');
    await fs.writeFile(svgIndexFilePath, `${warning}import { Feature, GenderOptions } from "./types";\n\n\nexport const svgsIndex: {[key in Feature]?: string[]} = ${JSON.stringify(svgsIndex)};\n\nexport const svgsGenders: {[key in Feature]?: GenderOptions[]} = ${JSON.stringify(svgsGenders)};`);
    console.log(`Wrote new file for svgs-index.ts at ${svgIndexFilePath} at time ${new Date().toISOString()}`);
};

export default processSVGs;
