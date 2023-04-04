import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { ObjectService } from "@common/object.service";
import { ConfigService } from "@config/config.service";

import { Track } from "@common/track.dto";

@Injectable()
export class TrackService extends ObjectService<Track> {
    public constructor(
        @Inject(MetadataService) private readonly metadataService: MetadataService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {
        super(metadataService, configService, ({ resolver, ...input }) => resolver.searchTrack(input));
    }
}
