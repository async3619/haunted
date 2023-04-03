import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";

import { AlbumService } from "@album/album.service";
import { AlbumResolver } from "@album/album.resolver";

@Module({
    imports: [MetadataModule],
    providers: [AlbumResolver, AlbumService],
})
export class AlbumModule {}
