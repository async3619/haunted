import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { SearchInput } from "@common/search-input.dto";
import { Track } from "@common/track.dto";

@Injectable()
export class TrackService {
    public constructor(@Inject(MetadataService) private readonly metadataService: MetadataService) {}

    public async search(input: SearchInput) {
        const resolvers = this.metadataService.getResolvers();
        const results: Track[] = [];
        for (const [, resolver] of resolvers) {
            const result = await resolver.searchTrack(input);
            results.push(...result);
        }

        return results;
    }
}
