import * as fs from "fs-extra";
import { Test, TestingModule } from "@nestjs/testing";

import { ConfigData, ConfigService, DEFAULT_CONFIG } from "@config/config.service";

jest.mock("fs-extra");

const mockedFs = fs as jest.Mocked<typeof fs>;

describe("ConfigService", () => {
    let service: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConfigService],
        }).compile();

        service = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to read config file from disk", async () => {
        const mockedConfig: ConfigData = {
            resolvers: {
                spotify: {
                    clientId: "testClientId",
                    clientSecret: "testClientSecret",
                },
            },
        };

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJson.mockResolvedValue(mockedConfig);

        await service.onModuleInit();

        expect(mockedFs.readJson).toBeCalledTimes(1);
        expect(service.getConfig()).toEqual(mockedConfig);
    });

    it("should write default config to disk if config file does not exist", async () => {
        mockedFs.existsSync.mockReturnValue(false);
        mockedFs.writeJson.mockResolvedValue();
        mockedFs.readJson.mockResolvedValue(DEFAULT_CONFIG);

        await service.onModuleInit();

        expect(mockedFs.writeJson).toBeCalledTimes(1);
        expect(mockedFs.writeJson).toBeCalledWith(expect.stringContaining("config.json"), DEFAULT_CONFIG, {
            spaces: 4,
        });
        expect(service.getConfig()).toEqual(DEFAULT_CONFIG);
    });

    it("should throw error if config file exists but is invalid", async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJson.mockResolvedValue({});

        await expect(service.onModuleInit()).rejects.toThrowError("config file is invalid.");
    });

    it("should write schema definition to disk in development mode", async () => {
        process.env.NODE_ENV = "development";

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJson.mockResolvedValue({ resolvers: {} });
        mockedFs.writeJson.mockImplementation(async () => {
            return;
        });

        await service.onModuleInit();

        expect(mockedFs.writeJson).toBeCalledTimes(1);
        expect(mockedFs.writeJson).toBeCalledWith(expect.stringContaining("config.schema.json"), expect.anything(), {
            spaces: 4,
        });

        process.env.NODE_ENV = "test";
    });

    it("should throw error when getConfig is called before onModuleInit", () => {
        expect(() => service.getConfig()).toThrowError("Config service is not initialized yet");
    });
});
