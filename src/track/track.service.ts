import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { ConfigData } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { ObjectService } from "@common/object.service";

import { Track } from "@common/track.dto";

@Injectable()
export class TrackService extends ObjectService<Track, "track"> {
    public constructor(
        @Inject(MetadataService) private readonly metadataService: MetadataService,
        @InjectConfig() private readonly configData: ConfigData,
    ) {
        super(metadataService, configData, "track");
    }
}
