import { Inject } from "@nestjs/common";
import { Args, Resolver, Query } from "@nestjs/graphql";

import { AlbumService } from "@album/album.service";
import { ArtistService } from "@artist/artist.service";

import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { Album } from "@common/album.dto";
import { GetItemInput } from "@common/get-item-input.dto";
import { RootArtistAlbumsInput } from "@common/artist-albums-input.dto";
import { ArtistAlbums } from "@common/artist-albums.dto";

import { Nullable } from "@utils/types";

@Resolver()
export class AlbumResolver {
    public constructor(
        @Inject(AlbumService) private readonly albumService: AlbumService,
        @Inject(ArtistService) private readonly artistService: ArtistService,
    ) {}

    @Query(() => Album, { nullable: true })
    public async album(@Args() { locale, id }: GetItemInput): Promise<Nullable<Album>> {
        return this.albumService.getItem(id, locale);
    }

    @Query(() => ArtistAlbums, { nullable: true })
    public async artistAlbums(
        @Args()
        { artistId, offset = 0, limit = 20, locale }: RootArtistAlbumsInput,
    ): Promise<Nullable<ArtistAlbums>> {
        return this.artistService.getArtistAlbums(artistId, offset, limit, locale);
    }

    @Query(() => [Album], { nullable: "items" })
    public async albums(@Args() { locale, ids }: GetItemsInput): Promise<Nullable<Album>[]> {
        return this.albumService.getItems(ids, locale);
    }

    @Query(() => [Album])
    public async searchAlbums(@Args() input: SearchInput): Promise<Album[]> {
        return this.albumService.search(input);
    }
}
