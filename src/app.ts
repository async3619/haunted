import chalk from "chalk";

import Server from "@root/server";

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
                message: `initialize '${chalk.green(resolver.getName())}' watcher`,
                task: () => resolver.initialize(),
            });
        }

        return new App(config, new Server(config.resolvers));
    }

    private constructor(private readonly config: Config, private readonly server: Server) {}

    public async start() {
        await this.server.start(this.config.port);

        App.logger.info(`Server started at port ${this.config.port}`);
    }
}
