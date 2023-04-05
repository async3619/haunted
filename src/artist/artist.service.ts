import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { ConfigData } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { ObjectService } from "@common/object.service";
import { Artist } from "@common/artist.dto";

@Injectable()
export class ArtistService extends ObjectService<Artist> {
    public constructor(
        @Inject(MetadataService) private readonly metadataService: MetadataService,
        @InjectConfig() private readonly configData: ConfigData,
    ) {
        super(metadataService, configData, ({ resolver, ...input }) => resolver.searchArtist(input));
    }
}
