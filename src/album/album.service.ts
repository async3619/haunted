import { Inject, Injectable } from "@nestjs/common";

import { Album } from "@common/album.dto";

import { MetadataService } from "@metadata/metadata.service";

import { ObjectService } from "@common/object.service";

@Injectable()
export class AlbumService extends ObjectService<Album> {
    public constructor(@Inject(MetadataService) private readonly metadataService: MetadataService) {
        super(metadataService, ({ resolver, ...input }) => resolver.searchAlbum(input));
    }
}
