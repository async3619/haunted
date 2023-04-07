import { NestExpressApplication } from "@nestjs/platform-express";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { initializeE2E } from "@test/utils/initializeE2E";
import { expectContainPartially } from "@test/utils/expectContainPartially";

import { Router } from "@root/router";

describe("Artist (e2e)", () => {
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

    describe("artists (TRPC)", () => {
        it("should be able to get artists", async () => {
            expectContainPartially(
                await client.artists.query({
                    ids: ["spotify::02WoRfOhF5nUVpwddshInq"],
                }),
                { name: "CHOILB" },
            );
        });

        it("should respect locale", async () => {
            expectContainPartially(
                await client.artists.query({
                    ids: ["spotify::02WoRfOhF5nUVpwddshInq"],
                }),
                { name: "CHOILB" },
            );

            expectContainPartially(
                await client.artists.query({
                    ids: ["spotify::02WoRfOhF5nUVpwddshInq"],
                    locale: "ko_KR",
                }),
                { name: "최엘비" },
            );
        });
    });

    describe("searchArtists (TRPC)", () => {
        it("should be able to search artists", async () => {
            expectContainPartially(
                await client.searchArtists.query({
                    query: "최엘비",
                    limit: 1,
                }),
                { name: "CHOILB" },
            );
        });

        it("should respect limit", async () => {
            const result = await client.searchArtists.query({
                query: "Test",
                limit: 5,
            });

            expect(result).toHaveLength(5);
        });

        it("should respect locale", async () => {
            expectContainPartially(
                await client.searchArtists.query({
                    query: "최엘비",
                    limit: 1,
                }),
                { name: "CHOILB" },
            );

            expectContainPartially(
                await client.searchArtists.query({
                    query: "최엘비",
                    locale: "ko_KR",
                    limit: 1,
                }),
                { name: "최엘비" },
            );
        });
    });
});
