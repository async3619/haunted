import { createAssert } from "typia";

import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

import { ResolverPair } from "@resolver";

import { SearchInput, SearchOutput } from "@utils/types";

export default class Server {
    private readonly resolvers: ResolverPair[];

    protected readonly t = initTRPC.create();
    protected readonly rootRouter = this.t.router({
        search: this.t.procedure.input(createAssert<SearchInput>()).query(({ input }) => this.search(input)),
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
            musics: results.flatMap(result => result.musics),
        };
    }
}

export type ServerRouter = Server["rootRouter"];
