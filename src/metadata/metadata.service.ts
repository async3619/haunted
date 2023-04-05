import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { ConfigData } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { createResolver, ResolverOptions, ResolverPair, ResolverTypes } from "@metadata/resolvers";

@Injectable()
export class MetadataService implements OnModuleInit {
    private readonly logger = new Logger(MetadataService.name);
    private readonly resolvers: ResolverPair[] = [];

    public constructor(@InjectConfig() private readonly config: ConfigData) {}

    public async onModuleInit() {
        const { resolvers } = this.config;

        for (const [name, options] of Object.entries(resolvers) as [ResolverTypes, ResolverOptions][]) {
            const resolver = createResolver(name, options);

            this.resolvers.push([name, resolver]);
            this.logger.log(`${resolver.constructor.name} is successfully instantiated`);
        }

        for (const [, resolver] of this.resolvers) {
            await resolver.initialize();
            this.logger.log(`${resolver.constructor.name} is successfully initialized`);
        }
    }

    public getResolvers(): ResolverPair[] {
        return [...this.resolvers];
    }
}
