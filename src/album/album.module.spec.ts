import { Test, TestingModule } from "@nestjs/testing";
import { AlbumModule } from "@album/album.module";

describe("AlbumModule", () => {
    it("should be able to import", async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AlbumModule],
        }).compile();

        expect(module).toBeDefined();
    });
});
