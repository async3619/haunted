import { Inject } from "@nestjs/common";
import { Args, Resolver, Query } from "@nestjs/graphql";

import { Album } from "@common/album.dto";
import { SearchInput } from "@common/search-input.dto";

import { AlbumService } from "@album/album.service";

@Resolver()
export class AlbumResolver {
    public constructor(@Inject(AlbumService) private readonly albumService: AlbumService) {}

    @Query(() => [Album])
    public async searchAlbums(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<Album[]> {
        return this.albumService.search(input);
    }
}
