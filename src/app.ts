import chalk from "chalk";

import Server from "@root/server";

import Config from "@utils/config";
import Logger from "@utils/logger";

export default class App {
    public static readonly logger = new Logger(App.name);
    private readonly server: Server;
    private readonly config: Config;

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

    private constructor(config: Config, server: Server) {
        this.config = config;
        this.server = server;
    }

    public async start(port = 3000) {
        await this.server.start(port);

        App.logger.info(`Server started at port ${port}`);
    }
}
