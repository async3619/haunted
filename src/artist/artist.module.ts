import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { ArtistService } from "@artist/artist.service";
import { ArtistResolver } from "@artist/artist.resolver";

@Module({
    imports: [MetadataModule, ConfigModule.forFeature()],
    providers: [ArtistResolver, ArtistService],
    exports: [ArtistService],
})
export class ArtistModule {}
