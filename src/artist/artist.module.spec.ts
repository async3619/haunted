import { Test, TestingModule } from "@nestjs/testing";

import { ArtistModule } from "@artist/artist.module";

describe("ArtistModule", () => {
    it("should be able to import", async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ArtistModule],
        }).compile();

        expect(module).toBeDefined();
    });
});
