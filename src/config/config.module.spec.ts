import * as fs from "fs-extra";
import { Test } from "@nestjs/testing";
import { ConfigData, ConfigModule, DEFAULT_CONFIG } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

jest.mock("fs-extra");

const mockedFs = fs as jest.Mocked<typeof fs>;

async function createMockedModule() {
    class MockService {
        public constructor(@InjectConfig() public readonly config: ConfigData) {}
    }

    const module = await Test.createTestingModule({
        imports: [ConfigModule.forFeature()],
        providers: [MockService],
    }).compile();

    const mockService = module.get(MockService);

    return { module, mockService };
}

describe("ConfigModule", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should be defined", () => {
        expect(module).toBeDefined();
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

        const { mockService } = await createMockedModule();

        expect(mockedFs.readJson).toBeCalledTimes(1);
        expect(mockService.config).toEqual(mockedConfig);
    });

    it("should write default config to disk if config file does not exist", async () => {
        mockedFs.existsSync.mockReturnValue(false);
        mockedFs.writeJson.mockResolvedValue();
        mockedFs.readJson.mockResolvedValue(DEFAULT_CONFIG);

        const { mockService } = await createMockedModule();

        expect(mockedFs.writeJson).toBeCalledTimes(1);
        expect(mockedFs.writeJson).toBeCalledWith(expect.stringContaining("config.json"), DEFAULT_CONFIG, {
            spaces: 4,
        });
        expect(mockService.config).toEqual(DEFAULT_CONFIG);
    });

    it("should throw error if config file exists but is invalid", async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJson.mockResolvedValue({});

        await expect(createMockedModule()).rejects.toThrowError("config file is invalid.");
    });

    it("should write schema definition to disk in development mode", async () => {
        process.env.NODE_ENV = "development";

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readJson.mockResolvedValue({ resolvers: {} });
        mockedFs.writeJson.mockImplementation(async () => {
            return;
        });

        await createMockedModule();

        expect(mockedFs.writeJson).toBeCalledTimes(1);
        expect(mockedFs.writeJson).toBeCalledWith(expect.stringContaining("config.schema.json"), expect.anything(), {
            spaces: 4,
        });

        process.env.NODE_ENV = "test";
    });
});
