import { createAssert } from "typia";
import { initTRPC } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { Inject, Injectable } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";

import { TrackService } from "@track/track.service";
import { AlbumService } from "@album/album.service";
import { ArtistService } from "@artist/artist.service";

import { ConfigData } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { GetItemInput } from "@common/get-item-input.dto";

@Injectable()
export class TRPCServerService {
    private readonly t = initTRPC.create();
    private readonly appRouter = this.t.router({
        track: this.t.procedure.input(createAssert<GetItemInput>()).query(({ input }) => {
            return this.trackService.getItem(input.id, input.locale);
        }),
        album: this.t.procedure.input(createAssert<GetItemInput>()).query(({ input }) => {
            return this.albumService.getItem(input.id, input.locale);
        }),
        artist: this.t.procedure.input(createAssert<GetItemInput>()).query(({ input }) => {
            return this.artistService.getItem(input.id, input.locale);
        }),

        tracks: this.t.procedure.input(createAssert<GetItemsInput>()).query(({ input }) => {
            return this.trackService.getItems(input.ids, input.locale);
        }),
        albums: this.t.procedure.input(createAssert<GetItemsInput>()).query(({ input }) => {
            return this.albumService.getItems(input.ids, input.locale);
        }),
        artists: this.t.procedure.input(createAssert<GetItemsInput>()).query(({ input }) => {
            return this.artistService.getItems(input.ids, input.locale);
        }),

        searchAlbums: this.t.procedure.input(createAssert<SearchInput>()).query(({ input }) => {
            return this.albumService.search(input);
        }),
        searchTracks: this.t.procedure.input(createAssert<SearchInput>()).query(({ input }) => {
            return this.trackService.search(input);
        }),
        searchArtists: this.t.procedure.input(createAssert<SearchInput>()).query(({ input }) => {
            return this.artistService.search(input);
        }),
    });

    public constructor(
        @InjectConfig() private readonly configData: ConfigData,
        @Inject(TrackService) private readonly trackService: TrackService,
        @Inject(AlbumService) private readonly albumService: AlbumService,
        @Inject(ArtistService) private readonly artistService: ArtistService,
    ) {}

    public applyMiddleware(app: NestExpressApplication) {
        const { servers = {} } = this.configData;
        const { trpc = {} } = servers;

        app.use(
            trpc.path || "/trpc",
            createExpressMiddleware({
                router: this.appRouter,
            }),
        );
    }

    public getRouter() {
        return this.appRouter;
    }
}
