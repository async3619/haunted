import { Inject, Injectable } from "@nestjs/common";

import { Album } from "@common/album.dto";

import { MetadataService } from "@metadata/metadata.service";

import { ConfigData } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { ObjectService } from "@common/object.service";

@Injectable()
export class AlbumService extends ObjectService<Album, "album"> {
    public constructor(
        @Inject(MetadataService) private readonly metadataService: MetadataService,
        @InjectConfig() private readonly configData: ConfigData,
    ) {
        super(metadataService, configData, "album");
    }
}
