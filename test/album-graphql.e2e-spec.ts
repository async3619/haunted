import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { PartialDeep } from "type-fest";

import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeE2E } from "@test/utils/initializeE2E";

import { SearchInput } from "@common/search-input.dto";
import { Album } from "@common/album.dto";

const searchAlbumsQuery = gql<{ searchAlbums: PartialDeep<Album> }, { input: SearchInput }>`
    query ($input: SearchInput!) {
        searchAlbums(input: $input) {
            id
            title
            artists {
                id
                name
            }
        }
    }
`;

describe("Album (e2e)", () => {
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

    describe("searchAlbums (GraphQL)", () => {
        let client: Client;

        beforeEach(() => {
            client = new Client({
                url: `${url}/graphql`,
                exchanges: [cacheExchange, fetchExchange],
                requestPolicy: "network-only",
            });
        });

        it("should be able to search albums", async () => {
            const { data } = await client
                .query(searchAlbumsQuery, { input: { query: "독립음악", limit: 1 } })
                .toPromise();

            expect(data?.searchAlbums).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "Independent Music",
                        artists: [
                            expect.objectContaining({
                                name: "CHOILB",
                            }),
                        ],
                    }),
                ]),
            );
        });

        it("should respect limit", async () => {
            const result_1 = await client
                .query(searchAlbumsQuery, { input: { query: "독립음악", limit: 1 } })
                .toPromise();

            const result_5 = await client
                .query(searchAlbumsQuery, { input: { query: "독립음악", limit: 5 } })
                .toPromise();

            expect(result_1.data?.searchAlbums).toHaveLength(1);
            expect(result_5.data?.searchAlbums).toHaveLength(5);
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(searchAlbumsQuery, { input: { query: "독립음악", limit: 1 } })
                .toPromise();

            const result_ko = await client
                .query(searchAlbumsQuery, { input: { query: "독립음악", limit: 1, locale: "ko_KR" } })
                .toPromise();

            expect(result_en.data?.searchAlbums[0].title).toBe("Independent Music");
            expect(result_ko.data?.searchAlbums[0].title).toBe("독립음악");
        });
    });
});
