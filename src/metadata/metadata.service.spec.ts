import { Test, TestingModule } from "@nestjs/testing";

import { ConfigModule } from "@config/config.module";

import { MetadataService } from "@metadata/metadata.service";

import { installConfigMock } from "@test/utils/installConfigMock";

describe("MetadataService", () => {
    let service: MetadataService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [MetadataService],
        }).compile();

        service = module.get<MetadataService>(MetadataService);
        installConfigMock(service["configService"]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to initialize", async () => {
        await service.onModuleInit();

        expect(service.getResolvers()).toHaveLength(1);
    });

    it("should be able to search", async () => {
        await service.onModuleInit();
        await service.search({
            query: "Test",
            limit: 10,
        });

        const [[, mockedResolver]] = service.getResolvers();

        expect(mockedResolver.search).toBeCalledTimes(1);
        expect(mockedResolver.search).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });
});
