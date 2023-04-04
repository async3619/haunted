import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { TrackService } from "@track/track.service";
import { TrackResolver } from "@track/track.resolver";

@Module({
    imports: [MetadataModule, ConfigModule],
    providers: [TrackResolver, TrackService],
})
export class TrackModule {}
