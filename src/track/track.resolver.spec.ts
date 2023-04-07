import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";

import { TrackResolver } from "@track/track.resolver";
import { TrackService } from "@track/track.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";
import { installMockedConfig } from "@test/utils/installMockedConfig";

describe("TrackResolver", () => {
    let resolver: TrackResolver;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, installMockedConfig()],
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

    it("should be able to get items", async () => {
        await resolver.tracks({
            ids: ["mocked::1", "mocked::2", "mocked::3"],
            locale: "en",
        });

        expect(mockedResolver.getTracks).toBeCalledTimes(1);
        expect(mockedResolver.getTracks).toBeCalledWith(["1", "2", "3"], "en");
    });

    it("should be able to get item", async () => {
        await resolver.track({
            id: "mocked::1",
            locale: "en",
        });

        expect(mockedResolver.getTracks).toBeCalledTimes(1);
        expect(mockedResolver.getTracks).toBeCalledWith(["1"], "en");
    });
});
