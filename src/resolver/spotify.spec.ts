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

    it("it should be able to initialize the resolver", async () => {
        await expect(target.initialize()).resolves.not.toThrow();
        await expect(target["client"].getAccessToken()).toBeDefined();
    });

    it("it should be able to search for a track", async () => {
        await target.initialize();

        const result = await target.search("Never Gonna Give You Up");

        expect(result).toBeDefined();
        expect(result.musics).toBeDefined();
        expect(result.musics.length).toBeGreaterThan(0);
    });
});
