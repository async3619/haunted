import { pathsToModuleNameMapper, type JestConfigWithTsJest } from "ts-jest";
import { compilerOptions } from "../tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: "..",
    testEnvironment: "node",
    testRegex: ".e2e-spec.ts$",
    transform: {
        "^.+\\.(t|j)s$": [
            "ts-jest",
            {
                compiler: "ttypescript",
            },
        ],
    },
    collectCoverageFrom: [
        "src/**/*.ts",
        "!index.ts",
        "!utils/noop.ts",
        "!**/node_modules/**",
        "!src/main.ts",
        "!src/**/*.spec.ts",
        "!src/router.ts",
    ],
    coverageDirectory: "./coverage-e2e",
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
