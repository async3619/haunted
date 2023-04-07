import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { PartialDeep } from "type-fest";

import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeE2E } from "@test/utils/initializeE2E";
import { expectContainPartially, expectContainPartiallyInArray } from "@test/utils/expect";

import { Track } from "@common/track.dto";
import { SearchInput } from "@common/search-input.dto";
import { GetItemsInput } from "@common/get-items-input.dto";
import { GetItemInput } from "@root/common/get-item-input.dto";

const searchTracksQuery = gql<{ searchTracks: PartialDeep<Track> }, { input: SearchInput }>`
    query ($input: SearchInput!) {
        searchTracks(input: $input) {
            id
            title
            artists {
                id
                name
            }
        }
    }
`;
const tracksQuery = gql<{ tracks: PartialDeep<Track>[] }, { input: GetItemsInput }>`
    query ($input: GetItemsInput!) {
        tracks(input: $input) {
            id
            title
            artists {
                id
                name
            }
        }
    }
`;
const trackQuery = gql<{ track: PartialDeep<Track> }, { input: GetItemInput }>`
    query ($input: GetItemInput!) {
        track(input: $input) {
            id
            title
            artists {
                id
                name
            }
        }
    }
`;

describe("Track (e2e)", () => {
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

    describe("track (GraphQL)", () => {
        it("should be able to get track", async () => {
            const { data } = await client
                .query(trackQuery, { input: { id: "spotify::7Jin5db4i7evTFvtGU1Am1" } })
                .toPromise();

            expectContainPartially(data?.track, {
                id: "spotify::7Jin5db4i7evTFvtGU1Am1",
                title: "Independent Music",
            });
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(trackQuery, { input: { id: "spotify::7Jin5db4i7evTFvtGU1Am1" } })
                .toPromise();

            const result_ko = await client
                .query(trackQuery, { input: { id: "spotify::7Jin5db4i7evTFvtGU1Am1", locale: "ko" } })
                .toPromise();

            expect(result_en.data?.track.title).toBe("Independent Music");
            expect(result_ko.data?.track.title).toBe("독립음악");
        });
    });

    describe("tracks (GraphQL)", () => {
        it("should be able to get tracks", async () => {
            const { data } = await client
                .query(tracksQuery, { input: { ids: ["spotify::7Jin5db4i7evTFvtGU1Am1"] } })
                .toPromise();

            expectContainPartiallyInArray(data?.tracks, {
                id: "spotify::7Jin5db4i7evTFvtGU1Am1",
                title: "Independent Music",
            });
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(tracksQuery, { input: { ids: ["spotify::7Jin5db4i7evTFvtGU1Am1"] } })
                .toPromise();

            const result_ko = await client
                .query(tracksQuery, { input: { ids: ["spotify::7Jin5db4i7evTFvtGU1Am1"], locale: "ko" } })
                .toPromise();

            expect(result_en.data?.tracks[0].title).toBe("Independent Music");
            expect(result_ko.data?.tracks[0].title).toBe("독립음악");
        });
    });

    describe("searchTracks (GraphQL)", () => {
        it("should be able to search tracks", async () => {
            const { data } = await client
                .query(searchTracksQuery, { input: { query: "WYBH save my life but...", limit: 1 } })
                .toPromise();

            expect(data?.searchTracks).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "WYBH save my life but...",
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
                .query(searchTracksQuery, { input: { query: "최엘비 독립음악", limit: 1 } })
                .toPromise();

            const result_5 = await client
                .query(searchTracksQuery, { input: { query: "최엘비 독립음악", limit: 5 } })
                .toPromise();

            expect(result_1.data?.searchTracks).toHaveLength(1);
            expect(result_5.data?.searchTracks).toHaveLength(5);
        });

        it("should respect locale", async () => {
            const result_en = await client
                .query(searchTracksQuery, { input: { query: "최엘비 독립음악", limit: 1 } })
                .toPromise();

            const result_ko = await client
                .query(searchTracksQuery, { input: { query: "최엘비 독립음악", limit: 1, locale: "ko_KR" } })
                .toPromise();

            expect(result_en.data?.searchTracks[0].title).toBe("Independent Music");
            expect(result_ko.data?.searchTracks[0].title).toBe("독립음악");
        });
    });
});
