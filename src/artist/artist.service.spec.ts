import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";

import { ArtistService } from "@artist/artist.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";
import { installMockedConfig } from "@test/utils/installMockedConfig";

describe("ArtistService", () => {
    let service: ArtistService;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, installMockedConfig()],
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

    it("should be able to get albums of artist", async () => {
        await expect(service.getArtistAlbums("mocked::test")).resolves.not.toThrow();
    });

    it("should return cached results for resolving albums of artist if they are available", async () => {
        const left = await service.getArtistAlbums("mocked::test");
        const right = await service.getArtistAlbums("mocked::test");

        expect(left === right).toBe(true);
    });

    it("should throw an error if there is no resolver for the given id", async () => {
        await expect(service.getArtistAlbums("test")).rejects.toThrow();
    });
});
