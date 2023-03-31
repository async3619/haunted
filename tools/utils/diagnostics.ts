import chalk from "chalk";
import * as ts from "typescript";

import { codeFrameColumns } from "@babel/code-frame";

const lastDiagnostics: ts.Diagnostic[] = [];
export function reportDiagnostic(diagnostic: ts.Diagnostic) {
    lastDiagnostics.push(diagnostic);
}

export function flushDiagnostics() {
    const diagnostics = [...lastDiagnostics];
    lastDiagnostics.length = 0;

    return diagnostics;
}

export function formatDiagnostic(diagnostic: ts.Diagnostic) {
    const originalMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

    let message = `${chalk.red("error")} ${chalk.gray(`TS${diagnostic.code}:`)} ${originalMessage}`;
    if (diagnostic.file) {
        const tokens = [chalk.cyan(`${diagnostic.file.fileName}`)];
        if (diagnostic.start) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            const endPosition = diagnostic.length
                ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start + diagnostic.length)
                : null;

            const frame = codeFrameColumns(
                diagnostic.file.text,
                {
                    start: { line: line + 1, column: character + 1 },
                    end: endPosition ? { line: endPosition.line + 1, column: endPosition.character + 1 } : undefined,
                },
                { highlightCode: true },
            );

            tokens.push(chalk.yellow(`${line + 1}`), chalk.yellow(`${character + 1}`));
            message += `\n${tokens.join(":")}\n\n${frame}\n`;
        } else {
            message += `\n${tokens.join(":")}\n`;
        }
    }

    return message;
}
