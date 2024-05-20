import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";
import { genders } from "./genders.js";
import { svgMetadata } from "./svg-metadata.js";

const warning =
  "// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See tools/process-svgs.js";

const processSVGs = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const svgFolder = path.join(__dirname, "..", "..", "svgs");

  const folders = fs.readdirSync(svgFolder);

  const svgs = {};

  for (const folder of folders) {
    if (folder === ".DS_Store") continue;
    svgs[folder] = {};

    const subfolder = path.join(svgFolder, folder);
    const files = fs.readdirSync(subfolder);
    for (const file of files) {
      if (!file.endsWith(".svg")) continue;
      const key = path.basename(file, ".svg");

      const contents = fs.readFileSync(path.join(subfolder, file), "utf8");
      const result = await optimize(contents, {
        multipass: true,
        plugins: [
          "preset-default",
          {
            name: "inlineStyles",
            params: {
              onlyMatchedOnce: false,
            },
          },
        ],
      });

      // Replace <svg> and </svg> tags
      svgs[folder][key] = result.data
        .replace(/.*<svg.*?>/, "")
        .replace("</svg>", "");
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "..", "..", "src", "svgs.ts"),
    `${warning}\n\nexport default ${JSON.stringify(svgs)};`,
  );

  const svgsIndex = {
    ...svgs,
  };
  for (const key of Object.keys(svgsIndex)) {
    svgsIndex[key] = Object.keys(svgsIndex[key]);
  }

  const legacyNameMap = {};

  const svgsMetadata = {
    ...svgsIndex,
  };
  for (const key of Object.keys(svgsMetadata)) {
    const keyMetadata = [];
    for (const featureName of svgsMetadata[key]) {
      let metadata = svgMetadata[key][featureName];
      metadata.name = featureName;
      if (metadata === undefined) {
        console.log(`Unknown metadata for ${key}/${featureName}`);
      }
      metadata.gender = metadata.gender || "both";
      metadata.sport = metadata.sport || "all";
      metadata.occurance = metadata.occurance || 1;
      metadata.clip = metadata.clip || false;
      metadata.noAngle = metadata.noAngle || false;

      if (metadata.legacyName) {
        legacyNameMap[metadata.legacyName] = featureName;
        delete metadata.legacyName;
      }

      keyMetadata.push(metadata);
    }
    svgsMetadata[key] = keyMetadata;
  }
  fs.writeFileSync(
    path.join(__dirname, "..", "..", "src", "svgs-index.ts"),
    `${warning}
    \n\nimport { SvgMetadata } from "./types"; 
    \n\nexport const svgsMetadata: Record<string, SvgMetadata[]> = ${JSON.stringify(svgsMetadata, null, 2)};
    \n\nexport const legacyNameMap: Record<string, string> = ${JSON.stringify(legacyNameMap, null, 2)};
    `,
  );

  console.log(
    `Wrote new src/svgs.ts and src/svgs-index.ts at ${new Date().toLocaleTimeString()}`,
  );
};

export { processSVGs };
