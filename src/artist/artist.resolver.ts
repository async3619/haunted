import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { ArtistService } from "@artist/artist.service";

import { SearchInput } from "@common/search-input.dto";
import { Artist } from "@common/artist.dto";

@Resolver()
export class ArtistResolver {
    public constructor(@Inject(ArtistService) private readonly artistService: ArtistService) {}

    @Query(() => [Artist])
    public async searchArtists(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<Artist[]> {
        return this.artistService.search(input);
    }
}
