import _ from "lodash";
import { OnModuleInit } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";
import BaseResolver from "@metadata/resolvers/base";

import { ConfigData } from "@config/config.module";

import { SearchInput } from "@common/search-input.dto";
import { MediaObject, MediaObjectMap, MediaTypeFromObject } from "@common/types";

import { CacheStorage } from "@utils/cache";
import { Nullable } from "@utils/types";

interface SearchInputData extends SearchInput {
    resolver: BaseResolver<string, any>;
}

interface ItemCacheData {
    id: string;
    locale?: string;
}

export class ObjectService<TItem extends MediaObject, TMediaType extends MediaTypeFromObject<TItem>>
    implements OnModuleInit
{
    private readonly searchCache = new CacheStorage<SearchInputData, MediaObjectMap[TMediaType][]>({
        keyBuilder: ({ resolver, locale, limit, query }) => `${resolver.getServiceName()}_${locale}_${limit}_${query}`,
    });

    private readonly itemCache = new CacheStorage<ItemCacheData, Nullable<MediaObjectMap[TMediaType]>>({
        keyBuilder: ({ id, locale }) => `${id}_${locale}`,
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

    public async getItem(id: string, locale?: string) {
        if (this.itemCache.has({ id, locale })) {
            return this.itemCache.getOrThrow({ id, locale });
        }

        for (const [, resolver] of this.metadata.getResolvers()) {
            const rawId = resolver.getRawId(id);
            if (!rawId) {
                continue;
            }

            const item = await resolver.getItem(rawId, this.type, locale);
            if (item) {
                this.itemCache.set({ id, locale }, item);
                return item;
            }
        }

        return null;
    }
    public async getItems(inputIds: string[], locale?: string) {
        const ids = _.uniq(inputIds);
        const items = new Map<string, Nullable<MediaObjectMap[TMediaType]>>();
        const missingIds = new Set(ids);

        for (const id of ids) {
            if (this.itemCache.has({ id, locale })) {
                items.set(id, this.itemCache.getOrThrow({ id, locale }));
                missingIds.delete(id);
            }
        }

        for (const [, resolver] of this.metadata.getResolvers()) {
            const rawIds = ids
                .filter(id => missingIds.has(id))
                .map(id => resolver.getRawId(id))
                .filter((id): id is string => id !== null);

            if (rawIds.length === 0) {
                continue;
            }

            const results = await resolver.getItems(rawIds, this.type, locale);
            for (let i = 0; i < results.length; i++) {
                const id = ids[i];
                const item = results[i];

                items.set(id, item);
                missingIds.delete(id);

                this.itemCache.set({ id, locale }, item);
            }
        }

        return ids.map(id => items.get(id) || null);
    }
}
