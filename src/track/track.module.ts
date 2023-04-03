import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";

import { TrackService } from "@track/track.service";
import { TrackResolver } from "@track/track.resolver";

@Module({
    imports: [MetadataModule],
    providers: [TrackResolver, TrackService],
})
export class TrackModule {}
