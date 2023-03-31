import { createAssert } from "typia";

import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

export const t = initTRPC.create();

interface SearchInput {
    query: string;
    limit?: number;
}

export default class Server {
    private readonly rootRouter = t.router({
        query: {
            search: t.procedure.input(createAssert<SearchInput>()).query(({ input }) => {
                console.log(input);

                return {
                    musics: [],
                };
            }),
        },
    });

    public start(port: number) {
        createHTTPServer({
            router: this.rootRouter,
        }).listen(port);
    }
}

export type ServerRouter = Server["rootRouter"];
