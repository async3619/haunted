import { Module } from "@nestjs/common";

import { MetadataModule } from "@metadata/metadata.module";
import { ConfigModule } from "@config/config.module";

import { TrackService } from "@track/track.service";
import { TrackResolver } from "@track/track.resolver";

@Module({
    imports: [MetadataModule, ConfigModule.forFeature()],
    providers: [TrackResolver, TrackService],
    exports: [TrackService],
})
export class TrackModule {}
