import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { AlbumService } from "@album/album.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("AlbumService", () => {
    let service: AlbumService;
    let resolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule, ConfigModule],
            providers: [AlbumService],
        }).compile();

        service = module.get<AlbumService>(AlbumService);
        resolver = installMetadataMock(service["metadataService"]);
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to search", async () => {
        await service.search({
            query: "Test",
            limit: 10,
        });

        expect(resolver.searchAlbum).toBeCalledTimes(1);
        expect(resolver.searchAlbum).toBeCalledWith({
            query: "Test",
            limit: 10,
        });
    });
});
