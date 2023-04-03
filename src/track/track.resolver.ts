import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { TrackService } from "@track/track.service";

import { SearchInput } from "@common/search-input.dto";
import { Track } from "@common/track.dto";

@Resolver()
export class TrackResolver {
    public constructor(@Inject(TrackService) private readonly trackService: TrackService) {}

    @Query(() => [Track])
    public async searchTracks(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<Track[]> {
        return this.trackService.search(input);
    }
}
