import * as path from "path";
import fs from "fs-extra";
import Ajv from "ajv";
import { application } from "typia";
import betterAjvErrors from "better-ajv-errors";

import { dereference } from "@apidevtools/json-schema-ref-parser";

import { createResolver, ResolverMap, ResolverOptionsMap, ResolverPair, ResolverTypes } from "@resolver";

import Logger from "@utils/logger";

const DEFAULT_CONFIG: ConfigData = {
    resolvers: {},
};

export interface ConfigData {
    resolvers: Partial<ResolverOptionsMap>;
}

const ajv = new Ajv({ allErrors: true, strict: false });

export default class Config {
    private static readonly logger = new Logger(Config.name);
    private static readonly DEFAULT_CONFIG_PATH = path.join(process.cwd(), "./haunted.json");
    private static readonly CONFIG_SCHEMA = application<[ConfigData]>();

    public static dumpConfigSchema(filePath: string) {
        return this.logger.task({
            level: "debug",
            message: "Write configuration schema file",
            task: async () => {
                const schema = await dereference(Config.CONFIG_SCHEMA);
                await fs.writeJson(filePath, schema["schemas"][0], { spaces: 4 });
            },
        });
    }

    public static async loadFrom(filePath: string = Config.DEFAULT_CONFIG_PATH) {
        if (!fs.existsSync(filePath)) {
            this.logger.warn(
                `Config file (path: ${filePath}) does not exist. we will make a new default config file for you.`,
            );

            await this.logger.task({
                level: "warn",
                message: "Create default config file",
                task: () => fs.writeJson(filePath, DEFAULT_CONFIG, { spaces: 4 }),
            });
        }

        const config = await this.logger.task({
            level: "info",
            message: "Load config file",
            task: async () => {
                const data: ConfigData = await fs.readJson(filePath);
                const schema = await dereference(Config.CONFIG_SCHEMA);
                const validate = ajv.compile<ConfigData>(schema["schemas"][0]);
                const valid = validate(data);
                if (!valid && validate.errors) {
                    const output = betterAjvErrors(schema, data, validate.errors, {
                        format: "cli",
                        indent: 4,
                    });

                    throw new Error(`config file is invalid.\n${output}`);
                }

                return data;
            },
        });

        const resolverTypes = Object.keys(config.resolvers) as ResolverTypes[];
        const resolvers: ResolverPair[] = [];
        for (const type of resolverTypes) {
            const configs = config.resolvers[type];
            if (!configs) {
                throw new Error(`watcher \`${type}\` is not configured.`);
            }

            const watcher = createResolver(type, configs);
            resolvers.push([type, watcher]);
        }

        if (process.env.NODE_ENV === "development") {
            await Config.dumpConfigSchema("./haunted.schema.json");
        }

        return new Config(Object.fromEntries(resolvers), resolvers);
    }

    private constructor(
        private readonly allResolverMap: Partial<ResolverMap>,
        private readonly allResolvers: ResolverPair[],
    ) {}

    public get resolverMap() {
        return {
            ...this.allResolverMap,
        };
    }
    public get resolvers() {
        return [...this.allResolvers];
    }
}