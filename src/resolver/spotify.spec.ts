import SpotifyResolver from "@resolver/spotify";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
    path: path.join(process.cwd(), "./.env.test"),
});

describe("Spotify Resolver", () => {
    let target: SpotifyResolver;

    beforeEach(() => {
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            throw new Error("Spotify client ID and secret must be set in environment variables.");
        }

        target = new SpotifyResolver({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });
    });

    it("should be able to initialize the resolver", async () => {
        await expect(target.initialize()).resolves.not.toThrow();
        await expect(target["client"].getAccessToken()).toBeDefined();
    });

    it("should be able to search for tracks", async () => {
        await target.initialize();

        const result = await target.searchMusics("Never Gonna Give You Up");

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for albums", async () => {
        await target.initialize();

        const result = await target.searchAlbums("Money Breath");

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for artists", async () => {
        await target.initialize();

        const result = await target.searchArtists("QM");

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for all", async () => {
        await target.initialize();

        const result = await target.search("QM");

        expect(result).toBeDefined();
        expect(result.musics.length).toBeGreaterThan(0);
        expect(result.albums.length).toBeGreaterThan(0);
        expect(result.artists.length).toBeGreaterThan(0);
    });

    it("should throw an error when search result is courrupted", async () => {
        await target.initialize();

        Object.defineProperty(target["client"], "search", {
            value: jest.fn().mockImplementation(() => {
                return {
                    body: {
                        artists: undefined,
                        albums: undefined,
                        tracks: undefined,
                    },
                };
            }),
        });

        await expect(target.searchMusics("")).rejects.toThrow();
        await expect(target.searchAlbums("")).rejects.toThrow();
        await expect(target.searchArtists("")).rejects.toThrow();
        await expect(target.search("")).rejects.toThrow();
    });
});
