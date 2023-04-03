import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";

import { ArtistService } from "@artist/artist.service";
import { ArtistResolver } from "@artist/artist.resolver";

@Module({
    imports: [MetadataModule],
    providers: [ArtistResolver, ArtistService],
})
export class ArtistModule {}
