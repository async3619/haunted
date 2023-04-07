import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { PartialDeep } from "type-fest";

import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeE2E } from "@test/utils/initializeE2E";

import { Artist } from "@common/artist.dto";
import { SearchInput } from "@common/search-input.dto";

const searchArtistsQuery = gql<{ searchArtists: PartialDeep<Artist> }, { input: SearchInput }>`
    query ($input: SearchInput!) {
        searchArtists(input: $input) {
            id
            name
        }
    }
`;

describe("Artist (e2e)", () => {
    let app: NestExpressApplication;
    let url: string;

    beforeEach(async () => {
        const result = await initializeE2E();
        app = result.app;
        url = result.url;
    });

    afterEach(async () => {
        await app.close();
    });

    describe("searchTracks (GraphQL)", () => {
        let client: Client;

        beforeEach(() => {
            client = new Client({
                url: `${url}/graphql`,
                exchanges: [cacheExchange, fetchExchange],
                requestPolicy: "network-only",
            });
        });

        it("should be able to search tracks", async () => {
            const { data } = await client
                .query(searchArtistsQuery, { input: { query: "최엘비", limit: 1 } })
                .toPromise();

            expect(data?.searchArtists).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: "CHOILB",
                    }),
                ]),
            );
        });

        it("should respect limit", async () => {
            const result_1 = await client
                .query(searchArtistsQuery, { input: { query: "최엘비", limit: 1 } })
                .toPromise();

            const result_5 = await client
                .query(searchArtistsQuery, { input: { query: "최엘비", limit: 5 } })
                .toPromise();

            expect(result_1.data?.searchArtists).toHaveLength(1);
            expect(result_5.data?.searchArtists).toHaveLength(5);
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(searchArtistsQuery, { input: { query: "최엘비", limit: 1 } })
                .toPromise();

            const result_ko = await client
                .query(searchArtistsQuery, { input: { query: "최엘비", limit: 1, locale: "ko_KR" } })
                .toPromise();

            expect(result_en.data?.searchArtists?.[0].name).toBe("CHOILB");
            expect(result_ko.data?.searchArtists?.[0].name).toBe("최엘비");
        });
    });
});
