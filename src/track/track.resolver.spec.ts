import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { TrackResolver } from "@track/track.resolver";
import { TrackService } from "@track/track.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("TrackResolver", () => {
    let resolver: TrackResolver;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, ConfigModule],
            providers: [TrackResolver, TrackService],
        }).compile();

        resolver = module.get<TrackResolver>(TrackResolver);
        mockedResolver = installMetadataMock(resolver["trackService"]["metadataService"]);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });

    it("should be able to search", async () => {
        await resolver.searchTracks({
            query: "Test",
            limit: 10,
        });

        expect(mockedResolver.searchTrack).toBeCalledTimes(1);
        expect(mockedResolver.searchTrack).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });
});
