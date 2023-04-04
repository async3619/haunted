import path from "path";
import { SpotifyResolver } from "@metadata/resolvers/spotify";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
    path: path.join(process.cwd(), "./.env.test"),
});

describe("SpotifyResolver", () => {
    let resolver: SpotifyResolver;

    beforeEach(() => {
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            throw new Error("Spotify client ID and secret must be set in environment variables.");
        }

        resolver = new SpotifyResolver({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });

    it("should be able to initialize ", async () => {
        await expect(resolver.initialize()).resolves.not.toThrow();
        await expect(resolver["client"].getAccessToken()).toBeDefined();
    });

    it("should be able to search for tracks", async () => {
        await resolver.initialize();

        const result = await resolver.searchTrack({
            query: "Money Breath",
        });

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for albums", async () => {
        await resolver.initialize();

        const result = await resolver.searchAlbum({
            query: "Money Breath",
        });

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for artists", async () => {
        await resolver.initialize();

        const result = await resolver.searchArtist({
            query: "QM",
        });

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should throw an error when search result is courrupted", async () => {
        await resolver.initialize();

        Object.defineProperty(resolver["client"], "search", {
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

        await expect(resolver.searchTrack({ query: "" })).rejects.toThrow();
        await expect(resolver.searchAlbum({ query: "" })).rejects.toThrow();
        await expect(resolver.searchArtist({ query: "" })).rejects.toThrow();
    });
});
