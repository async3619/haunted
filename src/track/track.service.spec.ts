import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";

import { TrackService } from "@track/track.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";
import { installMockedConfig } from "@test/utils/installMockedConfig";

describe("TrackService", () => {
    let service: TrackService;
    let resolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, installMockedConfig()],
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
