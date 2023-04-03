import { ChildProcess, spawn } from "child_process";
import * as ts from "typescript";
import * as tts from "ttypescript";
import { replaceTscAliasPaths } from "tsc-alias";

import { flushDiagnostics, formatDiagnostic, reportDiagnostic } from "./utils/diagnostics";
import { treeKillSync } from "./utils/process";
import printLog from "./utils/printLog";

function watchMain() {
    const configPath = tts.findConfigFile("./", ts.sys.fileExists, "tsconfig.build.json");
    if (!configPath) {
        throw new Error("Could not find a valid 'tsconfig.json'.");
    }

    const host = tts.createWatchCompilerHost(
        configPath,
        {},
        ts.sys,
        tts.createSemanticDiagnosticsBuilderProgram,
        reportDiagnostic,
        reportWatchStatusChanged.bind(null, configPath),
    );

    tts.createWatchProgram(host);
}

const startCompilingCode = [6031, 6032];
const errorCompilingCode = [6194, 6193];

async function reportWatchStatusChanged(
    configFile: string,
    diagnostic: ts.Diagnostic,
    newLine: string,
    options: ts.CompilerOptions,
    errorCount?: number,
) {
    if (startCompilingCode.includes(diagnostic.code)) {
        process.stdout.write("\x1Bc");
    }

    // on error
    if (errorCompilingCode.includes(diagnostic.code)) {
        const diagnostics = flushDiagnostics();
        for (const diagnostic of diagnostics) {
            const formattedErrorMessage = formatDiagnostic(diagnostic);
            console.log(formattedErrorMessage);
        }
    }

    if (typeof diagnostic.messageText === "string") {
        printLog(diagnostic.messageText);
    }

    // on success
    if (!errorCount && diagnostic.code === 6194) {
        await replaceTscAliasPaths({ configFile });
        printLog("Replaced typescript paths alias.");

        onBuildComplete();
    }
}

let childProcessRef: ChildProcess | undefined = undefined;
process.on("exit", () => childProcessRef?.pid && treeKillSync(childProcessRef.pid));

function onBuildComplete() {
    if (childProcessRef?.pid) {
        childProcessRef.removeAllListeners("exit");
        childProcessRef.on("exit", () => {
            childProcessRef = spawnProcess();
            childProcessRef.on("exit", () => (childProcessRef = undefined));
        });

        childProcessRef.stdin && (childProcessRef.stdin as typeof process.stdin).pause();
        treeKillSync(childProcessRef.pid);
    } else {
        childProcessRef = spawnProcess();
        childProcessRef.on("exit", (code: number) => {
            (process as any).exitCode = code;
            childProcessRef = undefined;
        });
    }
}

function spawnProcess() {
    let outputFilePath = "dist/main.js";
    let childProcessArgs: string[] = [];
    const argsStartIndex = process.argv.indexOf("--");
    if (argsStartIndex >= 0) {
        childProcessArgs = process.argv.slice(argsStartIndex + 1);
    }

    outputFilePath = outputFilePath.indexOf(" ") >= 0 ? `"${outputFilePath}"` : outputFilePath;

    return spawn("node", [outputFilePath, ...childProcessArgs], {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd(),
        env: {
            ...process.env,
            NODE_ENV: "development",
        },
    });
}

watchMain();
