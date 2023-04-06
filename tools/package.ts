import * as fs from "fs-extra";
import { generateDtsBundle } from "dts-bundle-generator";
import path from "path";
import * as process from "process";

import pkg from "../package.json";

const DIST_DIR = path.join(process.cwd(), "dist");
const PACKAGE_DIR = path.join(process.cwd(), "package");
const filesToCopy = ["README.md", "LICENSE"].map(file => path.join(process.cwd(), file));

export async function preparePackage() {
    if (!fs.existsSync(DIST_DIR)) {
        throw new Error("`./dist` directory does not exist. Did you run 'yarn build' first?");
    }

    const [definitionSourceCode] = generateDtsBundle([
        {
            filePath: "dist/router.d.ts",
            output: {
                noBanner: true,
            },
        },
    ]);

    const matched = definitionSourceCode.matchAll(
        /(import \{.*\} from ['"](.*?)['"])|(import ['"](.*?)['"])|(import\(['"](.*?)['"]\))/g,
    );

    const newDependencies = new Set<string>();
    for (const match of matched) {
        const packageName = match[2] || match[4] || match[6];
        if (packageName.startsWith(".")) {
            continue;
        }

        newDependencies.add(packageName);
    }

    const { scripts, dependencies, devDependencies, ...rest } = pkg;
    const newPkg = {
        ...rest,
        version: "0.0.0",
        main: "",
        types: "index.d.ts",
        dependencies: [...newDependencies].reduce((acc, dep) => {
            acc[dep] = "*";
            return acc;
        }, {}),
    };

    await fs.ensureDir(PACKAGE_DIR);
    await fs.writeJSON(path.join(PACKAGE_DIR, "package.json"), newPkg, { spaces: 4 });
    await fs.writeFile(path.join(PACKAGE_DIR, "index.d.ts"), definitionSourceCode);

    for (const file of filesToCopy) {
        await fs.copy(file, path.join(PACKAGE_DIR, path.basename(file)));
    }
}

preparePackage().then();
