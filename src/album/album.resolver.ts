import { Inject } from "@nestjs/common";
import { Args, Resolver, Query } from "@nestjs/graphql";

import { AlbumService } from "@album/album.service";

import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { Album } from "@common/album.dto";
import { GetItemInput } from "@common/get-item-input.dto";

import { Nullable } from "@utils/types";

@Resolver()
export class AlbumResolver {
    public constructor(@Inject(AlbumService) private readonly albumService: AlbumService) {}

    @Query(() => Album, { nullable: true })
    public async album(
        @Args("input", { type: () => GetItemInput }) { locale, id }: GetItemInput,
    ): Promise<Nullable<Album>> {
        return this.albumService.getItem(id, locale);
    }

    @Query(() => [Album], { nullable: "items" })
    public async albums(
        @Args("input", { type: () => GetItemsInput }) { locale, ids }: GetItemsInput,
    ): Promise<Nullable<Album>[]> {
        return this.albumService.getItems(ids, locale);
    }

    @Query(() => [Album])
    public async searchAlbums(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<Album[]> {
        return this.albumService.search(input);
    }
}
