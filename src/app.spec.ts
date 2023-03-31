import * as fs from "fs-extra";
import path from "path";

import App from "@root/app";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
    path: path.join(process.cwd(), "./.env.test"),
});

jest.mock("fs-extra");

const mockedFs = jest.mocked(fs);

describe("App", () => {
    beforeEach(() => {
        // preventing stdout from being polluted
        jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should be able to be initialized", async () => {
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            throw new Error("Spotify client ID and secret must be set in environment variables.");
        }

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJSON.mockResolvedValue({
            resolvers: {
                spotify: {
                    clientId: process.env.SPOTIFY_CLIENT_ID,
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                },
            },
        });

        const app = await App.initialize();

        expect(app).toBeDefined();
    });
});
