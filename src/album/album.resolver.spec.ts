import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";

import { AlbumResolver } from "@album/album.resolver";
import { AlbumService } from "@album/album.service";

import { installMockedConfig } from "@test/utils/installMockedConfig";
import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("AlbumResolver", () => {
    let resolver: AlbumResolver;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, installMockedConfig()],
            providers: [AlbumResolver, AlbumService],
        }).compile();

        resolver = module.get<AlbumResolver>(AlbumResolver);
        mockedResolver = installMetadataMock(resolver["albumService"]["metadataService"]);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });

    it("should be able to search", async () => {
        await resolver.searchAlbums({
            query: "Test",
            limit: 10,
        });

        expect(mockedResolver.searchAlbum).toBeCalledTimes(1);
        expect(mockedResolver.searchAlbum).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });

    it("should be able to get items", async () => {
        await resolver.albums({
            ids: ["mocked::1", "mocked::2", "mocked::3"],
            locale: "en",
        });

        expect(mockedResolver.getAlbums).toBeCalledTimes(1);
        expect(mockedResolver.getAlbums).toBeCalledWith(["1", "2", "3"], "en");
    });
});
