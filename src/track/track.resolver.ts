import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { TrackService } from "@track/track.service";

import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { GetItemInput } from "@common/get-item-input.dto";
import { Track } from "@common/track.dto";
import { Nullable } from "@utils/types";

@Resolver()
export class TrackResolver {
    public constructor(@Inject(TrackService) private readonly trackService: TrackService) {}

    @Query(() => Track, { nullable: true })
    public async track(@Args() { locale, id }: GetItemInput): Promise<Nullable<Track>> {
        return this.trackService.getItem(id, locale);
    }

    @Query(() => [Track], { nullable: "items" })
    public async tracks(@Args() { locale, ids }: GetItemsInput): Promise<Nullable<Track>[]> {
        return this.trackService.getItems(ids, locale);
    }

    @Query(() => [Track])
    public async searchTracks(@Args() input: SearchInput): Promise<Track[]> {
        return this.trackService.search(input);
    }
}
