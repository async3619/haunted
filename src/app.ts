import "reflect-metadata";

import chalk from "chalk";

import Config from "@utils/config";
import Logger from "@utils/logger";

export default class App {
    public static readonly logger = new Logger(App.name);

    public static async initialize() {
        this.logger.info("Initialize app");

        const config = await Config.loadFrom();
        for (const [, resolver] of config.resolvers) {
            await this.logger.task({
                level: "info",
                message: `Initialize '${chalk.green(resolver.getName())}' resolver`,
                task: () => resolver.initialize(),
            });
        }

        return new App(config);
    }

    private constructor(private readonly config: Config) {}

    public async start() {
        for (const [, server] of this.config.servers) {
            await App.logger.task({
                level: "info",
                message: `Start '${chalk.green(server.getName())}' server`,
                task: () => server.run(),
            });
        }
    }
}
