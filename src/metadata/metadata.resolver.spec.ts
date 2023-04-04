import { Test, TestingModule } from "@nestjs/testing";

import { ConfigModule } from "@config/config.module";

import { MetadataResolver } from "@metadata/metadata.resolver";
import { MetadataService } from "@metadata/metadata.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("MetadataResolver", () => {
    let resolver: MetadataResolver;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [MetadataResolver, MetadataService],
        }).compile();

        resolver = module.get<MetadataResolver>(MetadataResolver);
        mockedResolver = installMetadataMock(resolver["metadataService"]);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });

    it("should be able to search", async () => {
        await resolver.search({
            query: "Test",
            limit: 10,
        });

        expect(mockedResolver.search).toBeCalledTimes(1);
        expect(mockedResolver.search).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });
});
