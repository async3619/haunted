import { NestExpressApplication } from "@nestjs/platform-express";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { initializeE2E } from "@test/utils/initializeE2E";
import { expectContainPartially } from "@test/utils/expectContainPartially";

import { Router } from "@root/router";

describe("Album (e2e)", () => {
    let app: NestExpressApplication;
    let url: string;
    let client: ReturnType<typeof createTRPCProxyClient<Router>>;

    beforeEach(async () => {
        const result = await initializeE2E();
        app = result.app;
        url = result.url;
        client = createTRPCProxyClient<Router>({
            links: [
                httpBatchLink({
                    url: `${url}/trpc`,
                }),
            ],
        });
    });

    afterEach(async () => {
        await app.close();
    });

    describe("albums (TRPC)", () => {
        it("should be able to get albums", async () => {
            expectContainPartially(
                await client.albums.query({
                    ids: ["spotify::5KyAvL3uY3CsyNXPjKmDyU"],
                }),
                {
                    title: "Independent Music",
                    artists: [expect.objectContaining({ name: "CHOILB" })],
                },
            );
        });

        it("should respect locale", async () => {
            expectContainPartially(
                await client.albums.query({
                    ids: ["spotify::5KyAvL3uY3CsyNXPjKmDyU"],
                }),
                {
                    title: "Independent Music",
                    artists: [expect.objectContaining({ name: "CHOILB" })],
                },
            );

            expectContainPartially(
                await client.albums.query({
                    ids: ["spotify::5KyAvL3uY3CsyNXPjKmDyU"],
                    locale: "ko_KR",
                }),
                {
                    title: "독립음악",
                    artists: [expect.objectContaining({ name: "최엘비" })],
                },
            );
        });
    });

    describe("searchAlbums (TRPC)", () => {
        it("should be able to search albums", async () => {
            expectContainPartially(
                await client.searchAlbums.query({
                    query: "독립음악",
                    limit: 1,
                }),
                {
                    title: "Independent Music",
                    artists: [expect.objectContaining({ name: "CHOILB" })],
                },
            );
        });

        it("should respect limit", async () => {
            const result = await client.searchAlbums.query({
                query: "Test",
                limit: 5,
            });

            expect(result).toHaveLength(5);
        });

        it("should respect locale", async () => {
            expectContainPartially(
                await client.searchAlbums.query({
                    query: "독립음악",
                    limit: 1,
                }),
                {
                    title: "Independent Music",
                    artists: [expect.objectContaining({ name: "CHOILB" })],
                },
            );

            expectContainPartially(
                await client.searchAlbums.query({
                    query: "독립음악",
                    locale: "ko_KR",
                    limit: 1,
                }),
                {
                    title: "독립음악",
                    artists: [expect.objectContaining({ name: "최엘비" })],
                },
            );
        });
    });
});
