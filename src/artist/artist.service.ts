import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { SearchInput } from "@common/search-input.dto";
import { Artist } from "@common/artist.dto";

@Injectable()
export class ArtistService {
    public constructor(@Inject(MetadataService) private readonly metadataService: MetadataService) {}

    public async search(input: SearchInput) {
        const resolvers = this.metadataService.getResolvers();
        const result: Artist[] = [];
        for (const [, resolver] of resolvers) {
            const artists = await resolver.searchArtist(input);
            result.push(...artists);
        }

        return result;
    }
}
