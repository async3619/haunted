import { Test, TestingModule } from "@nestjs/testing";

import { TrackModule } from "@track/track.module";
import { AlbumModule } from "@album/album.module";
import { ArtistModule } from "@artist/artist.module";

import { TRPCServerService } from "@trpc-server/trpc-server.service";

import { installMockedConfig } from "@test/utils/installMockedConfig";

describe("TRPCService", () => {
    let service: TRPCServerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [installMockedConfig(), TrackModule, AlbumModule, ArtistModule],
            providers: [TRPCServerService],
        }).compile();

        service = module.get<TRPCServerService>(TRPCServerService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to get the router", () => {
        expect(service.getRouter()).toBeDefined();
    });
});
