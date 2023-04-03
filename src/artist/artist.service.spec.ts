import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";

import { ArtistService } from "@artist/artist.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("ArtistService", () => {
    let service: ArtistService;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule],
            providers: [ArtistService],
        }).compile();

        service = module.get<ArtistService>(ArtistService);
        mockedResolver = installMetadataMock(service["metadataService"]);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to search", async () => {
        await service.search({
            query: "Test",
            limit: 10,
        });

        expect(mockedResolver.searchArtist).toBeCalledTimes(1);
        expect(mockedResolver.searchArtist).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });
});
