import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { SearchResult } from "@common/search-result.dto";
import { SearchInput } from "@common/search-input.dto";

import { createResolver, ResolverOptions, ResolverPair, ResolverTypes } from "@metadata/resolvers";

import { ConfigService } from "@config/config.service";

@Injectable()
export class MetadataService implements OnModuleInit {
    private readonly logger = new Logger(MetadataService.name);
    private readonly resolvers: ResolverPair[] = [];

    public constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

    public async onModuleInit() {
        const { resolvers } = this.configService.getConfig();

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

    public async search(input: SearchInput): Promise<SearchResult> {
        const results: SearchResult[] = [];
        for (const [, resolver] of this.getResolvers()) {
            results.push(await resolver.search(input));
        }

        return {
            tracks: results.flatMap(result => result.tracks),
            albums: results.flatMap(result => result.albums),
            artists: results.flatMap(result => result.artists),
        };
    }
}
