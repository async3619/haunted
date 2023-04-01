import { createAssert } from "typia";

import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

import { ResolverPair } from "@resolver";

import { SearchAlbumsOutput, SearchOutput, SearchArtistsOutput, SearchInput, SearchMusicsOutput } from "@utils/types";

export default class Server {
    private readonly resolvers: ResolverPair[];

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

    public constructor(resolvers: ResolverPair[]) {
        this.resolvers = resolvers;
    }

    public start(port: number) {
        createHTTPServer({
            router: this.rootRouter,
        }).listen(port);
    }

    private async search(input: SearchInput): Promise<SearchOutput> {
        const results: SearchOutput[] = [];
        for (const resolver of this.resolvers) {
            const result = await resolver[1].search(input.query, input.limit);
            results.push(result);
        }

        return {
            musics: results.flatMap(item => item.musics),
            albums: results.flatMap(item => item.albums),
            artists: results.flatMap(item => item.artists),
        };
    }
    private async searchMusics(input: SearchInput): Promise<SearchMusicsOutput> {
        const results: SearchMusicsOutput[] = [];
        for (const resolver of this.resolvers) {
            const result = await resolver[1].searchMusics(input.query, input.limit);
            results.push(result);
        }

        return results.flatMap(item => item);
    }
    private async searchAlbums(input: SearchInput): Promise<SearchAlbumsOutput> {
        const results: SearchAlbumsOutput[] = [];
        for (const resolver of this.resolvers) {
            const result = await resolver[1].searchAlbums(input.query, input.limit);
            results.push(result);
        }

        return results.flatMap(item => item);
    }
    private async searchArtists(input: SearchInput): Promise<SearchArtistsOutput> {
        const results: SearchArtistsOutput[] = [];
        for (const resolver of this.resolvers) {
            const result = await resolver[1].searchArtists(input.query, input.limit);
            results.push(result);
        }

        return results.flatMap(item => item);
    }
}

export type ServerRouter = Server["rootRouter"];
