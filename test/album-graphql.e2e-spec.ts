import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { PartialDeep } from "type-fest";

import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeE2E } from "@test/utils/initializeE2E";

import { SearchInput } from "@common/search-input.dto";
import { Album } from "@common/album.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { expectContainPartially } from "@test/utils/expectContainPartially";

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
const albumsQuery = gql<{ albums: PartialDeep<Album>[] }, { input: GetItemsInput }>`
    query ($input: GetItemsInput!) {
        albums(input: $input) {
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
    let client: Client;

    beforeEach(async () => {
        const result = await initializeE2E();
        app = result.app;
        url = result.url;

        client = new Client({
            url: `${url}/graphql`,
            exchanges: [cacheExchange, fetchExchange],
            requestPolicy: "network-only",
        });
    });

    afterEach(async () => {
        await app.close();
    });

    describe("albums (GraphQL)", () => {
        it("should be able to get albums", async () => {
            const { data } = await client
                .query(albumsQuery, { input: { ids: ["spotify::5DxGRsBdRlbyWoEWvrYQ5P"] } })
                .toPromise();

            expectContainPartially(data?.albums, {
                id: "spotify::5DxGRsBdRlbyWoEWvrYQ5P",
                title: "angel",
            });
        });

        it("should respect locale", async () => {
            const { data: en } = await client
                .query(albumsQuery, { input: { ids: ["spotify::5KyAvL3uY3CsyNXPjKmDyU"] } })
                .toPromise();

            const { data: ko } = await client
                .query(albumsQuery, { input: { ids: ["spotify::5KyAvL3uY3CsyNXPjKmDyU"], locale: "ko_KR" } })
                .toPromise();

            expect(en?.albums[0].title).toBe("Independent Music");
            expect(ko?.albums[0].title).toBe("독립음악");
        });
    });

    describe("searchAlbums (GraphQL)", () => {
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
