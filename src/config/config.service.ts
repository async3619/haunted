import * as _ from "lodash";
import * as fs from "fs-extra";
import * as path from "path";
import Ajv from "ajv";
import { application } from "typia";
import betterAjvErrors from "better-ajv-errors";

import { dereference } from "@apidevtools/json-schema-ref-parser";

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ResolverOptionsMap } from "@metadata/resolvers";

export type ConfigData = {
    resolvers: Partial<ResolverOptionsMap>;
};

const ajv = new Ajv({ allErrors: true, strict: false });
export const DEFAULT_CONFIG: ConfigData = {
    resolvers: {},
};

@Injectable()
export class ConfigService implements OnModuleInit {
    private static readonly CONFIG_FILE_PATH = path.join(process.cwd(), "config.json");
    private static readonly CONFIG_SCHEMA = application<[ConfigData]>();

    private readonly logger: Logger = new Logger(ConfigService.name);
    private appConfig: ConfigData | null = null;

    public async onModuleInit(): Promise<void> {
        if (!fs.existsSync(ConfigService.CONFIG_FILE_PATH)) {
            this.logger.warn(`Config file does not exist. we will make a new default config file for you.`);
            await fs.writeJson(ConfigService.CONFIG_FILE_PATH, DEFAULT_CONFIG, {
                spaces: 4,
            });
        }

        const schema = await dereference(ConfigService.CONFIG_SCHEMA);
        if (process.env.NODE_ENV === "development") {
            this.logger.debug("Write config file schema to ./config.schema.json");

            await fs.writeJson(path.join(process.cwd(), "config.schema.json"), schema["schemas"][0], {
                spaces: 4,
            });
        }

        const data: ConfigData = await fs.readJson(ConfigService.CONFIG_FILE_PATH);
        const validate = ajv.compile<ConfigData>(schema["schemas"][0]);
        const valid = validate(data);
        if (!valid && validate.errors) {
            const output = betterAjvErrors(schema, data, validate.errors, {
                format: "cli",
                indent: 4,
            });

            throw new Error(`config file is invalid.\n${output}`);
        }

        this.appConfig = data;
        this.logger.log(`Configuration successfully loaded`);
    }

    public getConfig(): ConfigData {
        if (!this.appConfig) {
            throw new Error("Config service is not initialized yet");
        }

        return _.cloneDeep(this.appConfig);
    }
}
