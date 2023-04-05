import path from "path";

import { DynamicModule, Provider } from "@nestjs/common";

import { ConfigData, ConfigModule } from "@config/config.module";
import { CONFIG_DATA } from "@config/config.decorator";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
    path: path.join(process.cwd(), "./.env.test"),
});

export function installMockedConfig(): DynamicModule {
    const configDataProvider: Provider = {
        provide: CONFIG_DATA,
        useFactory: (): ConfigData => {
            if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
                throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set");
            }

            return {
                resolvers: {
                    spotify: {
                        clientId: process.env.SPOTIFY_CLIENT_ID,
                        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                    },
                },
            };
        },
    };

    return {
        module: ConfigModule,
        providers: [configDataProvider],
        exports: [configDataProvider],
    };
}
