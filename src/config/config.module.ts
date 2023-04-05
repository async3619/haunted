import * as fs from "fs-extra";
import path from "path";
import betterAjvErrors from "better-ajv-errors";
import { application } from "typia";
import { PartialDeep } from "type-fest";
import Ajv from "ajv";

import { dereference } from "@apidevtools/json-schema-ref-parser";

import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";
import { ResolverOptionsMap } from "@metadata/resolvers";

import { CONFIG_DATA } from "@config/config.decorator";

export type ServerTypes = "graphql" | "trpc";
export type ServerConfig = {
    [key in ServerTypes]: {
        path: string;
    };
};

export type ConfigData = {
    cacheTTL?: number;
    resolvers: Partial<ResolverOptionsMap>;
    servers?: PartialDeep<ServerConfig>;
};

const ajv = new Ajv({ allErrors: true, strict: false });
export const DEFAULT_CONFIG: ConfigData = {
    resolvers: {},
};

@Module({})
export class ConfigModule {
    private static readonly CONFIG_FILE_PATH = path.join(process.cwd(), "config.json");
    private static readonly CONFIG_SCHEMA = application<[ConfigData]>();
    private static readonly logger = new Logger(ConfigModule.name);

    public static forRoot(): DynamicModule {
        return {
            module: ConfigModule,
            providers: [],
            exports: [],
        };
    }

    public static forFeature(): DynamicModule {
        const configDataProvider: Provider = {
            provide: CONFIG_DATA,
            useFactory: async () => {
                return ConfigModule.loadConfigData();
            },
        };

        return {
            module: ConfigModule,
            providers: [configDataProvider],
            exports: [configDataProvider],
        };
    }

    private static async loadConfigData(): Promise<ConfigData> {
        if (!fs.existsSync(ConfigModule.CONFIG_FILE_PATH)) {
            ConfigModule.logger.warn(`Config file does not exist. we will make a new default config file for you.`);
            await fs.writeJson(ConfigModule.CONFIG_FILE_PATH, DEFAULT_CONFIG, {
                spaces: 4,
            });
        }

        const schema = await dereference(ConfigModule.CONFIG_SCHEMA);
        if (process.env.NODE_ENV === "development") {
            ConfigModule.logger.debug("Write config file schema to ./config.schema.json");

            await fs.writeJson(path.join(process.cwd(), "config.schema.json"), schema["schemas"][0], {
                spaces: 4,
            });
        }

        const data: ConfigData = await fs.readJson(ConfigModule.CONFIG_FILE_PATH);
        const validate = ajv.compile<ConfigData>(schema["schemas"][0]);
        const valid = validate(data);
        if (!valid && validate.errors) {
            const output = betterAjvErrors(schema, data, validate.errors, {
                format: "cli",
                indent: 4,
            });

            throw new Error(`config file is invalid.\n${output}`);
        }

        ConfigModule.logger.log(`Configuration successfully loaded`);
        return data;
    }
}
