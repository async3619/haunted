import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { AlbumResolver } from "@album/album.resolver";
import { AlbumService } from "@album/album.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("AlbumResolver", () => {
    let resolver: AlbumResolver;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, ConfigModule],
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
});
