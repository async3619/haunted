import { Inject, Injectable } from "@nestjs/common";

import { Album } from "@common/album.dto";

import { MetadataService } from "@metadata/metadata.service";

import { ObjectService } from "@common/object.service";
import { ConfigService } from "@config/config.service";

@Injectable()
export class AlbumService extends ObjectService<Album> {
    public constructor(
        @Inject(MetadataService) private readonly metadataService: MetadataService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {
        super(metadataService, configService, ({ resolver, ...input }) => resolver.searchAlbum(input));
    }
}
