import { pathsToModuleNameMapper, type JestConfigWithTsJest } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: "./src",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": [
            "ts-jest",
            {
                compiler: "ttypescript",
            },
        ],
    },
    collectCoverageFrom: ["**/*.ts", "!index.ts", "!utils/noop.ts", "!**/node_modules/**"],
    coverageDirectory: "../coverage",
    testEnvironment: "node",
    roots: ["<rootDir>"],
    modulePaths: [compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    collectCoverage: false,
    coverageThreshold: {
        global: {
            lines: 0,
            branches: 0,
            functions: 0,
            statements: 0,
        },
    },
};

export = jestConfig;
