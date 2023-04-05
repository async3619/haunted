import { Module } from "@nestjs/common";

import { TrackModule } from "@track/track.module";
import { AlbumModule } from "@album/album.module";
import { ArtistModule } from "@artist/artist.module";

import { TRPCServerService } from "@trpc-server/trpc-server.service";

@Module({
    imports: [TrackModule, AlbumModule, ArtistModule],
    providers: [TRPCServerService],
    exports: [TRPCServerService],
})
export class TRPCServerModule {}
