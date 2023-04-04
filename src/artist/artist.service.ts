import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { ObjectService } from "@common/object.service";
import { Artist } from "@common/artist.dto";

@Injectable()
export class ArtistService extends ObjectService<Artist> {
    public constructor(@Inject(MetadataService) private readonly metadataService: MetadataService) {
        super(metadataService, ({ resolver, ...input }) => resolver.searchArtist(input));
    }
}
