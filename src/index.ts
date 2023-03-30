async function clearConsole() {
    process.stdout.write("\x1Bc");
}

async function main() {
    console.log(":D");
}

clearConsole().then(main).then();
