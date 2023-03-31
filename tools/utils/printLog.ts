import dayjs from "dayjs";
import chalk from "chalk";

export default function printLog(message: string) {
    const currentTime = dayjs().format("HH:mm:ss");
    console.info(`[${chalk.gray(currentTime)}] ${message}\n`);
}
