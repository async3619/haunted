import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { PartialDeep } from "type-fest";

import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeE2E } from "@test/utils/initializeE2E";
import { expectContainPartially, expectContainPartiallyInArray } from "@test/utils/expect";

import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { GetItemInput } from "@common/get-item-input.dto";
import { Artist } from "@common/artist.dto";
import { ArtistAlbums } from "@common/artist-albums.dto";
import { RootArtistAlbumsInput } from "@common/artist-albums-input.dto";

const searchArtistsQuery = gql<{ searchArtists: PartialDeep<Artist> }, { input: SearchInput }>`
    query ($input: SearchInput!) {
        searchArtists(input: $input) {
            id
            name
        }
    }
`;
const artistsQuery = gql<{ artists: PartialDeep<Artist>[] }, { input: GetItemsInput }>`
    query ($input: GetItemsInput!) {
        artists(input: $input) {
            id
            name
        }
    }
`;
const artistQuery = gql<{ artist: PartialDeep<Artist> }, { input: GetItemInput }>`
    query ($input: GetItemInput!) {
        artist(input: $input) {
            id
            name
        }
    }
`;
const artistAlbumsQuery = gql<{ artist: { albums: ArtistAlbums } }, RootArtistAlbumsInput>`
    query ($offset: Int, $limit: Int, $locale: String, $artistId: String!) {
        artist(input: { id: $artistId }) {
            albums(offset: $offset, limit: $limit, locale: $locale) {
                total
                items {
                    id
                    title
                }
            }
        }
    }
`;

describe("Artist (e2e)", () => {
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

    describe("artist (GraphQL)", () => {
        it("should be able to get artist", async () => {
            const { data } = await client
                .query(artistQuery, { input: { id: "spotify::02WoRfOhF5nUVpwddshInq" } })
                .toPromise();

            expectContainPartially(data?.artist, {
                name: "CHOILB",
            });
        });

        it("should be able to return null if artist is not found", async () => {
            const { data } = await client.query(artistQuery, { input: { id: "spotify::test" } }).toPromise();

            expect(data?.artist).toBeNull();
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(artistQuery, { input: { id: "spotify::02WoRfOhF5nUVpwddshInq" } })
                .toPromise();

            const result_ko = await client
                .query(artistQuery, { input: { id: "spotify::02WoRfOhF5nUVpwddshInq", locale: "ko_KR" } })
                .toPromise();

            expect(result_en.data?.artist?.name).toBe("CHOILB");
            expect(result_ko.data?.artist?.name).toBe("최엘비");
        });
    });

    describe("artist.albums (GraphQL)", () => {
        it("should be able to get albums of artist", async () => {
            const { data } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::6a8cUmqOsXmjzq1aWKiVpH" })
                .toPromise();

            expect(data?.artist.albums.total).toStrictEqual(expect.any(Number));
            expect(data?.artist.albums.items?.some(item => item.title === "The Anecdote")).toBe(true);
        });

        it("should respect offset and limit", async () => {
            const { data } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::6a8cUmqOsXmjzq1aWKiVpH", offset: 1, limit: 1 })
                .toPromise();

            const { data: withoutOffset } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::6a8cUmqOsXmjzq1aWKiVpH", limit: 1 })
                .toPromise();

            expect(data?.artist.albums.items).toHaveLength(1);
            expect(withoutOffset?.artist.albums.items).toHaveLength(1);
            expect(data?.artist.albums).not.toEqual(withoutOffset?.artist.albums);
        });

        it("should respect locale", async () => {
            const { data: en } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::02WoRfOhF5nUVpwddshInq" })
                .toPromise();

            const { data: ko } = await client
                .query(artistAlbumsQuery, { artistId: "spotify::02WoRfOhF5nUVpwddshInq", locale: "ko_KR" })
                .toPromise();

            expect(en?.artist.albums.items?.[0].title).toBe("Independent Music");
            expect(ko?.artist.albums.items?.[0].title).toBe("독립음악");
        });
    });

    describe("artists (GraphQL)", () => {
        it("should be able to get artists", async () => {
            const { data } = await client
                .query(artistsQuery, { input: { ids: ["spotify::02WoRfOhF5nUVpwddshInq"] } })
                .toPromise();

            expectContainPartiallyInArray(data?.artists, {
                name: "CHOILB",
            });
        });

        it("should be able to return null if artist is not found", async () => {
            const { data } = await client.query(artistsQuery, { input: { ids: ["spotify::test"] } }).toPromise();

            expect(data?.artists?.[0]).toBeNull();
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(artistsQuery, { input: { ids: ["spotify::02WoRfOhF5nUVpwddshInq"] } })
                .toPromise();

            const result_ko = await client
                .query(artistsQuery, { input: { ids: ["spotify::02WoRfOhF5nUVpwddshInq"], locale: "ko_KR" } })
                .toPromise();

            expect(result_en.data?.artists?.[0].name).toBe("CHOILB");
            expect(result_ko.data?.artists?.[0].name).toBe("최엘비");
        });
    });

    describe("searchArtists (GraphQL)", () => {
        it("should be able to search tracks", async () => {
            const { data } = await client
                .query(searchArtistsQuery, { input: { query: "최엘비", limit: 1 } })
                .toPromise();

            expectContainPartiallyInArray(data?.searchArtists, {
                name: "CHOILB",
            });
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
