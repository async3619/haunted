import * as fs from "fs-extra";

(async () => {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error("Spotify client ID and secret must be set in environment variables.");
    }

    if (fs.existsSync("./config.json")) {
        await fs.unlink("./config.json");
    }

    await fs.writeJson(
        "./config.json",
        {
            resolvers: {
                spotify: {
                    clientId: process.env.SPOTIFY_CLIENT_ID,
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                },
            },
        },
        { spaces: 4 },
    );
})();
