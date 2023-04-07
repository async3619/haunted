import path from "path";
import { SpotifyResolver } from "@metadata/resolvers/spotify";
import { Request } from "@utils/request";

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

    afterEach(() => {
        jest.restoreAllMocks();
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

        const result = await resolver.search(
            {
                query: "Money Breath",
            },
            "track",
        );

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for albums", async () => {
        await resolver.initialize();

        const result = await resolver.search(
            {
                query: "Money Breath",
            },
            "album",
        );

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should be able to search for artists", async () => {
        await resolver.initialize();

        const result = await resolver.search(
            {
                query: "QM",
            },
            "artist",
        );

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it("should throw an error when search result is corrupted", async () => {
        resolver["request"] = jest.fn().mockResolvedValue({ body: {} });

        await expect(resolver.search({ query: "" }, "artist")).rejects.toThrow("Invalid response");
        await expect(resolver.search({ query: "" }, "track")).rejects.toThrow("Invalid response");
        await expect(resolver.search({ query: "" }, "album")).rejects.toThrow("Invalid response");
    });

    it("should refresh access token automatically when it expires", async () => {
        await resolver.initialize();

        jest.spyOn(Request.prototype, "executeJson").mockResolvedValueOnce({
            headers: {},
            statusCode: 401,
            body: {
                error: {
                    message: "The access token expired",
                    status: 401,
                },
            },
        });

        await expect(resolver.search({ query: "돈숨" }, "album")).resolves.not.toThrow();
    });

    it("should throw an error when api returns an error", async () => {
        jest.spyOn(Request.prototype, "executeJson").mockResolvedValueOnce({
            headers: {},
            statusCode: 400,
            body: {
                error: {
                    message: "Bad request",
                    status: 400,
                },
            },
        });

        await expect(resolver.search({ query: "돈숨" }, "album")).rejects.toThrow("Bad request (400)");
    });
});
