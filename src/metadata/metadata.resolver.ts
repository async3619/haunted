import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { SearchResult } from "@common/search-result.dto";
import { SearchInput } from "@common/search-input.dto";

import { MetadataService } from "@metadata/metadata.service";

@Resolver()
export class MetadataResolver {
    public constructor(@Inject(MetadataService) private readonly metadataService: MetadataService) {}

    @Query(() => SearchResult)
    public async search(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<SearchResult> {
        return this.metadataService.search(input);
    }
}
