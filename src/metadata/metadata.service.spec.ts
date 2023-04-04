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
});
