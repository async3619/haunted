import { Test, TestingModule } from "@nestjs/testing";

import { ConfigModule } from "@config/config.module";

import { MetadataResolver } from "@metadata/metadata.resolver";
import { MetadataService } from "@metadata/metadata.service";

describe("MetadataResolver", () => {
    let resolver: MetadataResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [MetadataResolver, MetadataService],
        }).compile();

        resolver = module.get<MetadataResolver>(MetadataResolver);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });
});
