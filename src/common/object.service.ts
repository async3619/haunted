import { OnModuleInit } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";
import BaseResolver from "@metadata/resolvers/base";

import { ConfigData } from "@config/config.module";

import { SearchInput } from "@common/search-input.dto";
import { MediaObject, MediaObjectMap, MediaTypeFromObject } from "@common/types";

import { CacheStorage } from "@utils/cache";

interface SearchInputData extends SearchInput {
    resolver: BaseResolver<string, any>;
}

export class ObjectService<TItem extends MediaObject, TMediaType extends MediaTypeFromObject<TItem>>
    implements OnModuleInit
{
    private readonly searchCache = new CacheStorage<SearchInputData, MediaObjectMap[TMediaType][]>({
        keyBuilder: ({ resolver, locale, limit, query }) => `${resolver.getServiceName()}_${locale}_${limit}_${query}`,
    });

    constructor(
        private readonly metadata: MetadataService,
        private readonly config: ConfigData,
        private readonly type: TMediaType,
    ) {}

    public onModuleInit() {
        const config = this.config;
        if (typeof config.cacheTTL !== "number") {
            return;
        }

        this.searchCache.setTimeToLive(config.cacheTTL);
    }

    public async search(input: SearchInput) {
        const results: MediaObjectMap[TMediaType][] = [];
        for (const [, resolver] of this.metadata.getResolvers()) {
            const inputData: SearchInputData = {
                ...input,
                resolver,
            };

            const cache = await this.searchCache.get(inputData);
            if (cache) {
                results.push(...cache);
                continue;
            }

            const items = await resolver.search(input, this.type);
            this.searchCache.set(inputData, items);

            results.push(...items);
        }

        return results;
    }
}
