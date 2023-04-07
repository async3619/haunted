import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { ArtistService } from "@artist/artist.service";

import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { GetItemInput } from "@common/get-item-input.dto";
import { Artist } from "@common/artist.dto";

@Resolver()
export class ArtistResolver {
    public constructor(@Inject(ArtistService) private readonly artistService: ArtistService) {}

    @Query(() => Artist, { nullable: true })
    public async artist(
        @Args("input", { type: () => GetItemInput }) { locale, id }: GetItemInput,
    ): Promise<Artist | null> {
        return this.artistService.getItem(id, locale);
    }

    @Query(() => [Artist])
    public async artists(
        @Args("input", { type: () => GetItemsInput }) { locale, ids }: GetItemsInput,
    ): Promise<Artist[]> {
        return this.artistService.getItems(ids, locale);
    }

    @Query(() => [Artist])
    public async searchArtists(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<Artist[]> {
        return this.artistService.search(input);
    }
}
