import { Test, TestingModule } from "@nestjs/testing";

import { MetadataModule } from "@metadata/metadata.module";

import { ArtistResolver } from "@artist/artist.resolver";
import { ArtistService } from "@artist/artist.service";

import { installMetadataMock, MockResolver } from "@test/utils/installMetadataMock";

describe("ArtistResolver", () => {
    let resolver: ArtistResolver;
    let mockedResolver: MockResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MetadataModule],
            providers: [ArtistResolver, ArtistService],
        }).compile();

        resolver = module.get<ArtistResolver>(ArtistResolver);
        mockedResolver = installMetadataMock(resolver["artistService"]["metadataService"]);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });

    it("should be able to search", async () => {
        await resolver.searchArtists({
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
