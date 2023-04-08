import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { PartialDeep } from "type-fest";

import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeE2E } from "@test/utils/initializeE2E";
import { expectContainPartially, expectContainPartiallyInArray } from "@test/utils/expect";

import { Album } from "@common/album.dto";
import { ArtistAlbums } from "@common/artist-albums.dto";
import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { GetItemInput } from "@common/get-item-input.dto";
import { RootArtistAlbumsInput } from "@common/artist-albums-input.dto";

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
const albumQuery = gql<{ album: PartialDeep<Album> }, { input: GetItemInput }>`
    query ($input: GetItemInput!) {
        album(input: $input) {
            id
            title
            artists {
                id
                name
            }
        }
    }
`;
const artistAlbumsQuery = gql<{ artistAlbums: PartialDeep<ArtistAlbums> }, RootArtistAlbumsInput>`
    query ($offset: Int, $limit: Int, $locale: String, $artistId: String!) {
        artistAlbums(artistId: $artistId, offset: $offset, limit: $limit, locale: $locale) {
            total
            items {
                id
                title
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

    describe("album (GraphQL)", () => {
        it("should be able to get album", async () => {
            const { data } = await client
                .query(albumQuery, { input: { id: "spotify::5DxGRsBdRlbyWoEWvrYQ5P" } })
                .toPromise();

            expectContainPartially(data?.album, {
                id: "spotify::5DxGRsBdRlbyWoEWvrYQ5P",
                title: "angel",
            });
        });

        it("should be able to return null if album is not found", async () => {
            const { data } = await client.query(albumQuery, { input: { id: "spotify::test" } }).toPromise();

            expect(data?.album).toBeNull();
        });

        it("should respect locale", async () => {
            const { data: en } = await client
                .query(albumQuery, { input: { id: "spotify::5KyAvL3uY3CsyNXPjKmDyU" } })
                .toPromise();

            const { data: ko } = await client
                .query(albumQuery, { input: { id: "spotify::5KyAvL3uY3CsyNXPjKmDyU", locale: "ko_KR" } })
                .toPromise();

            expect(en?.album.title).toBe("Independent Music");
            expect(ko?.album.title).toBe("독립음악");
        });
    });

    describe("artistAlbums (GraphQL)", () => {
        it("should be able to get albums of artist", async () => {
            const { data } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::6a8cUmqOsXmjzq1aWKiVpH" })
                .toPromise();

            expect(data?.artistAlbums.total).toStrictEqual(expect.any(Number));
            expect(data?.artistAlbums.items?.some(item => item.title === "The Anecdote")).toBe(true);
        });

        it("should respect offset and limit", async () => {
            const { data } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::6a8cUmqOsXmjzq1aWKiVpH", offset: 1, limit: 1 })
                .toPromise();

            const { data: withoutOffset } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::6a8cUmqOsXmjzq1aWKiVpH", limit: 1 })
                .toPromise();

            expect(data?.artistAlbums.items).toHaveLength(1);
            expect(withoutOffset?.artistAlbums.items).toHaveLength(1);
            expect(data?.artistAlbums).not.toStrictEqual(withoutOffset?.artistAlbums);
        });

        it("should respect locale", async () => {
            const { data: en } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::02WoRfOhF5nUVpwddshInq" })
                .toPromise();

            const { data: ko } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::02WoRfOhF5nUVpwddshInq", locale: "ko_KR" })
                .toPromise();

            expect(en?.artistAlbums.items?.[0].title).toBe("Independent Music");
            expect(ko?.artistAlbums.items?.[0].title).toBe("독립음악");
        });
    });

    describe("albums (GraphQL)", () => {
        it("should be able to get albums", async () => {
            const { data } = await client
                .query(albumsQuery, { input: { ids: ["spotify::5DxGRsBdRlbyWoEWvrYQ5P"] } })
                .toPromise();

            expectContainPartiallyInArray(data?.albums, {
                id: "spotify::5DxGRsBdRlbyWoEWvrYQ5P",
                title: "angel",
            });
        });

        it("should be able to return null if album is not found", async () => {
            const { data } = await client.query(albumsQuery, { input: { ids: ["spotify::test"] } }).toPromise();

            expect(data?.albums).toEqual([null]);
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
