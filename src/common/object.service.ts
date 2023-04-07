import _ from "lodash";
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

    private readonly itemCache = new CacheStorage<ItemCacheData, MediaObjectMap[TMediaType]>({
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
        const ids = inputIds.map(id => ({ id, locale }));
        const results: MediaObjectMap[TMediaType][] = [];
        const cachedIds = ids.filter(id => this.itemCache.has(id));
        const cachedItems = this.itemCache.getManyOrThrow(cachedIds);
        results.push(...cachedItems);

        const newIds = ids.filter(id => !this.itemCache.has(id));
        const newItems: MediaObjectMap[TMediaType][] = [];
        for (const [, resolver] of this.metadata.getResolvers()) {
            const targetIds = newIds.map(({ id }) => resolver.getRawId(id)).filter((id): id is string => !!id);
            if (targetIds.length === 0) {
                continue;
            }

            const items = await resolver.getItems(targetIds, this.type, locale);
            newItems.push(...items);
        }

        this.itemCache.setMany(newItems.map(item => [{ id: item.id, locale }, item]));
        results.push(...newItems);

        const resultMap = _.chain(results).keyBy("id").value();
        return ids.map(({ id }) => {
            const item = resultMap[id];
            if (!item) {
                throw new Error(`Requested resource with id ('${id}') not found`);
            }

            return item;
        });
    }
}
