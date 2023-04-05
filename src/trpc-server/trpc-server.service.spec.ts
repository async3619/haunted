import { Test, TestingModule } from "@nestjs/testing";

import { TrackModule } from "@track/track.module";
import { AlbumModule } from "@album/album.module";
import { ArtistModule } from "@artist/artist.module";

import { TRPCServerService } from "@trpc-server/trpc-server.service";

describe("TRPCService", () => {
    let service: TRPCServerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TrackModule, AlbumModule, ArtistModule],
            providers: [TRPCServerService],
        }).compile();

        service = module.get<TRPCServerService>(TRPCServerService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should search tracks", async () => {
        jest.spyOn(service["trackService"], "search").mockImplementation(() => Promise.resolve([]));

        const result = await service["searchTracks"]({ input: { query: "test" } });

        expect(result).toEqual([]);
        expect(service["trackService"].search).toHaveBeenCalledWith({ query: "test" });
    });

    it("should search albums", async () => {
        jest.spyOn(service["albumService"], "search").mockImplementation(() => Promise.resolve([]));

        const result = await service["searchAlbums"]({ input: { query: "test" } });

        expect(result).toEqual([]);
        expect(service["albumService"].search).toHaveBeenCalledWith({ query: "test" });
    });

    it("should search artists", async () => {
        jest.spyOn(service["artistService"], "search").mockImplementation(() => Promise.resolve([]));

        const result = await service["searchArtists"]({ input: { query: "test" } });

        expect(result).toEqual([]);
        expect(service["artistService"].search).toHaveBeenCalledWith({ query: "test" });
    });

    it("should be able to get the router", () => {
        expect(service.getRouter()).toBeDefined();
    });
});
