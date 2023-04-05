import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { AlbumService } from "@album/album.service";
import { AlbumResolver } from "@album/album.resolver";

@Module({
    imports: [MetadataModule, ConfigModule.forFeature()],
    providers: [AlbumResolver, AlbumService],
    exports: [AlbumService],
})
export class AlbumModule {}
