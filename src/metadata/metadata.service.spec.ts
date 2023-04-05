import { Test, TestingModule } from "@nestjs/testing";

import { MetadataService } from "@metadata/metadata.service";

import { installMockedConfig } from "@test/utils/installMockedConfig";

describe("MetadataService", () => {
    let service: MetadataService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [installMockedConfig()],
            providers: [MetadataService],
        }).compile();

        service = module.get<MetadataService>(MetadataService);
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
