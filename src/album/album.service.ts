import { Inject, Injectable } from "@nestjs/common";

import { SearchInput } from "@common/search-input.dto";
import { Album } from "@common/album.dto";

import { MetadataService } from "@metadata/metadata.service";

@Injectable()
export class AlbumService {
    public constructor(@Inject(MetadataService) private readonly metadataService: MetadataService) {}

    public async search(input: SearchInput) {
        const resolvers = this.metadataService.getResolvers();
        const results: Album[] = [];
        for (const [, resolver] of resolvers) {
            const result = await resolver.searchAlbum(input);
            results.push(...result);
        }

        return results;
    }
}
