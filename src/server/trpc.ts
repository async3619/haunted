import { createAssert } from "typia";
import express from "express";
import * as http from "http";

import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

import BaseServer from "@server/base";

import { ResolverPair } from "@resolver";

import iterate from "@utils/iterate";
import { SearchOutput, SearchInput, Music, Album, Artist } from "@utils/types";

interface TRPCServerOptions {
    port: number;
}

export default class TRPCServer extends BaseServer<"TRPC", TRPCServerOptions> {
    protected readonly t = initTRPC.create();
    protected readonly rootRouter = this.t.router({
        search: this.t.procedure.input(createAssert<SearchInput>()).query(({ input }) => this.search(input)),

        searchMusics: this.t.procedure
            .input(createAssert<SearchInput>())
            .query(({ input }) => this.searchMusics(input)),

        searchAlbums: this.t.procedure
            .input(createAssert<SearchInput>())
            .query(({ input }) => this.searchAlbums(input)),

        searchArtists: this.t.procedure
            .input(createAssert<SearchInput>())
            .query(({ input }) => this.searchArtists(input)),
    });

    private express: express.Express | null = null;
    private server: http.Server | null = null;

    public constructor(options: TRPCServerOptions, resolvers: ReadonlyArray<ResolverPair>) {
        super("TRPC", options, resolvers);
    }

    public isRunning() {
        return !!this.server && this.server.listening;
    }

    public start() {
        this.express = express();
        this.express.use("/", trpcExpress.createExpressMiddleware({ router: this.rootRouter }));

        const expressInstance = this.express;
        return new Promise<void>(resolve => {
            this.server = expressInstance.listen(this.options.port, () => {
                resolve();
            });
        });
    }
    public async stop() {
        const server = this.server;
        if (!server) {
            throw new Error("TRPCServer has not been started yet");
        }

        return new Promise<void>(resolve => {
            server.close(() => {
                resolve();
            });
        });
    }

    private async searchMusics(input: SearchInput): Promise<Music[]> {
        const result = await iterate(
            this.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchMusics(input.query, input.limit),
        );

        return result.flatMap(musics => musics);
    }
    private async searchAlbums(input: SearchInput): Promise<Album[]> {
        const result = await iterate(
            this.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchAlbums(input.query, input.limit),
        );

        return result.flatMap(albums => albums);
    }
    private async searchArtists(input: SearchInput): Promise<Artist[]> {
        const result = await iterate(
            this.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchArtists(input.query, input.limit),
        );

        return result.flatMap(artists => artists);
    }
    private async search(input: SearchInput): Promise<SearchOutput> {
        const result = await iterate(
            this.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.search(input.query, input.limit),
        );

        return {
            musics: result.flatMap(item => item.musics),
            albums: result.flatMap(item => item.albums),
            artists: result.flatMap(item => item.artists),
        };
    }
}

export type TRPCServerRouter = TRPCServer["rootRouter"];
