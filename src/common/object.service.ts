import { MetadataService } from "@metadata/metadata.service";
import BaseResolver from "@metadata/resolvers/base";

import { SearchInput } from "@common/search-input.dto";

import { CacheStorage } from "@utils/cache";
import { AsyncFn } from "@utils/types";

interface SearchInputData extends SearchInput {
    resolver: BaseResolver<string, any>;
}

export class ObjectService<TItem> {
    private readonly searchCache = new CacheStorage<SearchInputData, TItem[]>({
        keyBuilder: ({ resolver, locale, limit, query }) => `${resolver.getName()}_${locale}_${limit}_${query}`,
    });

    protected constructor(
        private readonly metadata: MetadataService,
        private readonly searchFn: AsyncFn<SearchInputData, TItem[]>,
    ) {}

    public async search(input: SearchInput) {
        const results: TItem[] = [];
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

            const items = await this.searchFn(inputData);
            this.searchCache.set(inputData, items);

            results.push(...items);
        }

        return results;
    }
}
