import * as fs from "fs-extra";
import path from "path";

import Config, { ConfigData, DEFAULT_CONFIG } from "@utils/config";

jest.mock("fs-extra");

const mockedFs = jest.mocked(fs);

describe("Config", () => {
    beforeEach(() => {
        // preventing stdout from being polluted
        jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("it should be able to load from file", async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJSON.mockResolvedValue(DEFAULT_CONFIG);

        const config = await Config.loadFrom();

        expect(config).toBeDefined();
        expect(mockedFs.readJSON).toBeCalledTimes(1);
    });

    it("it should create a new config file if it doesn't exist", async () => {
        mockedFs.existsSync.mockReturnValue(false);
        mockedFs.writeJSON.mockResolvedValue();
        mockedFs.readJSON.mockResolvedValue(DEFAULT_CONFIG);

        const config = await Config.loadFrom();

        expect(config).toBeDefined();
        expect(mockedFs.writeJSON).toBeCalledTimes(1);
        expect(mockedFs.writeJSON).toBeCalledWith(path.join(process.cwd(), "./haunted.json"), DEFAULT_CONFIG, {
            spaces: 4,
        });
    });

    it("it should throw an error if the config file is invalid", async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJSON.mockResolvedValue({});

        await expect(Config.loadFrom()).rejects.toThrowError("config file is invalid.");
    });

    it("it should instantiate resolvers from config", async () => {
        const configData: ConfigData = {
            port: 3000,
            resolvers: {
                spotify: {
                    clientId: "MOCK_CLIENT_ID",
                    clientSecret: "MOCK_CLIENT_SECRET",
                },
            },
        };

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJSON.mockResolvedValue(configData);

        const config = await Config.loadFrom();

        expect(config).toBeDefined();
        expect(config.resolvers).toHaveLength(1);
        expect(config.resolverMap.spotify?.getOptions()).toStrictEqual({
            clientId: "MOCK_CLIENT_ID",
            clientSecret: "MOCK_CLIENT_SECRET",
        });
    });

    it("it should be able to dump config schema", async () => {
        mockedFs.writeJSON.mockResolvedValue();

        await Config.dumpConfigSchema("MOCK_PATH");

        expect(mockedFs.writeJSON).toBeCalledTimes(1);
        expect(mockedFs.writeJSON).toBeCalledWith("MOCK_PATH", expect.anything(), { spaces: 4 });
    });
});
