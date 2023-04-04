import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { TrackService } from "@track/track.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("TrackService", () => {
    let service: TrackService;
    let resolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, ConfigModule],
            providers: [TrackService],
        }).compile();

        service = module.get<TrackService>(TrackService);
        resolver = installMetadataMock(service["metadataService"]);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to search", async () => {
        await service.search({
            query: "Test",
            limit: 10,
        });

        expect(resolver.searchTrack).toBeCalledTimes(1);
        expect(resolver.searchTrack).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });
});
